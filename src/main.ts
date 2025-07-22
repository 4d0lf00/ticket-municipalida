import { bootstrapApplication } from "@angular/platform-browser"
import { appConfig } from "./app/app.config"
import { AppComponent } from "./app/app.component"
import {
  Chart,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

Chart.register(
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
);

bootstrapApplication(AppComponent, appConfig).catch((err) => console.error(err))

// Inyectar CSS para forzar wrap en el toolbar de TinyMCE y evitar scroll horizontal
document.addEventListener('DOMContentLoaded', () => {
  const style = document.createElement('style');
  style.innerHTML = `
    .tox .tox-toolbar--scrolling {
      flex-wrap: wrap !important;
      overflow-x: visible !important;
      max-width: 100% !important;
    }
    .tox .tox-toolbar__group {
      flex-wrap: wrap !important;
      display: flex !important;
      width: 100% !important;
      min-width: 0 !important;
      max-width: 100% !important;
    }
  `;
  document.head.appendChild(style);
});
