import React from 'react';
import DeviceControls from '../components/DeviceControls';
import SensorChart from '../components/SensorChart';
import SensorStats from '../components/SensorStats';
import useSensorReadings from '../hooks/useSensorReadings';

export default function Dashboard() {
  const sensors = useSensorReadings();
  return (
    <section className="dashboard-panel" aria-label="Tổng quan nhà thông minh">
      <SensorStats {...sensors} />
      {/* Hai biểu đồ và các thẻ số đo dùng chung dữ liệu từ useSensorReadings. */}
      <div className="dashboard-body">
        {/* biểu đồ nhiệt độ độ ẩm */}
        <article className="chart-card">
          <div className="chart-heading">
            <h2>Nhiệt độ &amp; Độ ẩm</h2>
            <div className="chart-legend">
              <span>
                <i className="legend-temperature" />
                Nhiệt độ (°C)
              </span>
              <span>
                <i className="legend-humidity" />
                Độ ẩm (%)
              </span>
            </div>
          </div>
          {/* Không truyền lightOnly nên component vẽ đồng thời nhiệt độ và độ ẩm*/}
          <SensorChart
            data={sensors.chart}
            loading={sensors.chartLoading}
            error={
              sensors.chartErrors.temperature || sensors.chartErrors.humidity
            }
            onRetry={sensors.retryChart}
          />
        </article>
        {/* biểu đồ ánh sáng */}
        <article className="chart-card light-chart">
          <div className="chart-heading">
            <h2>Cường độ ánh sáng</h2>
            <div className="chart-legend">
              <span>
                <i className="legend-light" />
                Ánh sáng (lux)
              </span>
            </div>
          </div>
          {/* lightOnly chọn chuỗi số đo ánh sáng; thang đo tự điều chỉnh theo dữ liệu. */}
          <SensorChart
            lightOnly
            data={sensors.chart}
            loading={sensors.chartLoading}
            error={sensors.chartErrors.light}
            onRetry={sensors.retryChart}
          />
        </article>

        <DeviceControls />
      </div>
    </section>
  );
}
