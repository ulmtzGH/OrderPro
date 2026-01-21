import { AfterViewInit, ChangeDetectionStrategy, Component, computed, effect, ElementRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderService } from '../../services/order.service';
import { Order, OrderStatus } from '../../models/order.model';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';
import { RouterLink } from '@angular/router';

// Declaring the d3 variable to make it available in the component context
declare var d3: any;

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent implements AfterViewInit {
  private orderService = inject(OrderService);
  private elementRef = inject(ElementRef);
  authService = inject(AuthService);

  orders = this.orderService.orders;
  currentUser = this.authService.currentUser as () => User;
  
  private todaysOrders = computed(() => {
    const orders = this.orders();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return orders.filter(o => o.createdAt >= today);
  });

  stats = computed(() => {
    return {
      totalSales: this.todaysOrders().reduce((sum, order) => sum + order.total, 0),
      pendingOrders: this.orders().filter(o => o.status === 'Pendiente').length,
      inPreparationOrders: this.orders().filter(o => o.status === 'En Preparación').length,
      readyOrders: this.orders().filter(o => o.status === 'Listo para servir').length,
    };
  });

  // Data for charts
  salesByHour = computed(() => {
    const hourlySales = Array(24).fill(0).map((_, i) => ({ hour: i, sales: 0 }));
    this.todaysOrders().forEach(order => {
        const hour = order.createdAt.getHours();
        hourlySales[hour].sales += order.total;
    });
    return hourlySales;
  });

  orderStatusDistribution = computed(() => {
    const statuses: OrderStatus[] = ['Pendiente', 'En Preparación', 'Listo para servir'];
    const distribution = new Map<OrderStatus, number>();
    statuses.forEach(s => distribution.set(s, 0));
    
    this.orders()
        .filter(o => statuses.includes(o.status))
        .forEach(o => distribution.set(o.status, (distribution.get(o.status) || 0) + 1));
        
    return Array.from(distribution.entries()).map(([status, count]) => ({ status, count }));
  });

  topSellingProducts = computed(() => {
    const productCounts = new Map<string, number>();
    this.todaysOrders().forEach(order => {
        order.items.forEach(item => {
            productCounts.set(item.product.name, (productCounts.get(item.product.name) || 0) + item.quantity);
        });
    });
    return Array.from(productCounts.entries())
        .map(([name, quantity]) => ({ name, quantity }))
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5);
  });

  constructor() {
    effect(() => {
      // Re-render charts when order data changes
      if (this.elementRef.nativeElement.querySelector('#sales-chart')) {
        this.createCharts();
      }
    });
  }

  ngAfterViewInit() {
    this.createCharts();
  }

  private createCharts() {
    this.createSalesByHourChart();
    this.createOrderStatusDistributionChart();
    this.createTopSellingProductsChart();
  }

  private createSalesByHourChart() {
    const data = this.salesByHour();
    const element = this.elementRef.nativeElement.querySelector('#sales-chart');
    if (!element) return;
    
    d3.select(element).select('svg').remove();
    
    if (data.every(d => d.sales === 0)) {
        element.innerHTML = `<div class="flex items-center justify-center h-full text-slate-400">No hay datos de ventas hoy.</div>`;
        return;
    }
    element.innerHTML = '';

    const margin = {top: 20, right: 20, bottom: 50, left: 50};
    const width = element.clientWidth - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    const svg = d3.select(element).append('svg')
        .attr('viewBox', `0 0 ${element.clientWidth} 300`)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);
    
    const x = d3.scaleBand().range([0, width]).domain(data.map(d => `${d.hour}:00`)).padding(0.2);
    svg.append('g').attr('transform', `translate(0,${height})`).call(d3.axisBottom(x))
        .selectAll('text').attr('class', 'fill-current text-slate-400 text-xs').style('text-anchor', 'end').attr('transform', 'rotate(-45)');

    const y = d3.scaleLinear().domain([0, d3.max(data, d => d.sales) * 1.1 || 10]).range([height, 0]);
    svg.append('g').call(d3.axisLeft(y).ticks(5).tickFormat(d => `€${d}`)).selectAll('text').attr('class', 'fill-current text-slate-400 text-xs');
    
    svg.selectAll('rect').data(data).enter().append('rect')
        .attr('x', d => x(`${d.hour}:00`)).attr('y', d => y(d.sales))
        .attr('width', x.bandwidth()).attr('height', d => height - y(d.sales))
        .attr('fill', '#2563eb');
  }

  private createOrderStatusDistributionChart() {
      const data = this.orderStatusDistribution().filter(d => d.count > 0);
      const element = this.elementRef.nativeElement.querySelector('#status-chart');
      if (!element) return;
      d3.select(element).select('svg').remove();

      if (data.length === 0) {
          element.innerHTML = `<div class="flex items-center justify-center h-full text-slate-400">No hay órdenes activas.</div>`;
          return;
      }
      element.innerHTML = '';
      
      const width = element.clientWidth;
      const height = 300;
      const radius = Math.min(width, height) / 2 - 20;

      const svg = d3.select(element).append('svg')
          .attr('viewBox', `0 0 ${width} ${height}`)
          .append('g').attr('transform', `translate(${width/2},${height/2})`);

      const color = d3.scaleOrdinal()
          .domain(data.map(d => d.status))
          .range(['#eab308', '#3b82f6', '#a855f7']); // yellow, blue, purple

      const pie = d3.pie().value(d => d.count);
      const data_ready = pie(data);

      const arc = d3.arc().innerRadius(radius * 0.5).outerRadius(radius * 0.8);

      svg.selectAll('path').data(data_ready).enter().append('path')
          .attr('d', arc).attr('fill', d => color(d.data.status))
          .attr('stroke', '#1e293b').style('stroke-width', '2px');

      svg.selectAll('text').data(data_ready).enter().append('text')
        .text(d => `${d.data.status}: ${d.data.count}`)
        .attr('transform', d => `translate(${d3.arc().innerRadius(radius*0.9).outerRadius(radius*0.9).centroid(d)})`)
        .style('text-anchor', 'middle').attr('class', 'fill-current text-white text-xs font-semibold');
  }

  private createTopSellingProductsChart() {
    const data = this.topSellingProducts();
    const element = this.elementRef.nativeElement.querySelector('#top-products-chart');
    if (!element) return;
    d3.select(element).select('svg').remove();

    if (data.length === 0) {
        element.innerHTML = `<div class="flex items-center justify-center h-full text-slate-400">No se han vendido productos hoy.</div>`;
        return;
    }
    element.innerHTML = '';

    const margin = {top: 20, right: 30, bottom: 40, left: 150};
    const width = element.clientWidth - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    const svg = d3.select(element).append('svg')
        .attr('viewBox', `0 0 ${element.clientWidth} 300`)
        .append('g').attr('transform', `translate(${margin.left},${margin.top})`);
        
    const y = d3.scaleBand().range([0, height]).domain(data.map(d => d.name)).padding(0.1);
    svg.append('g').call(d3.axisLeft(y)).selectAll('text').attr('class', 'fill-current text-slate-300');

    const x = d3.scaleLinear().domain([0, d3.max(data, d => d.quantity) || 10]).range([0, width]);
    svg.append('g').attr('transform', `translate(0,${height})`).call(d3.axisBottom(x)).selectAll('text').attr('class', 'fill-current text-slate-400');

    svg.selectAll('rect').data(data).enter().append('rect')
        .attr('y', d => y(d.name)).attr('x', x(0))
        .attr('width', d => x(d.quantity)).attr('height', y.bandwidth())
        .attr('fill', '#1d4ed8');
  }
}