import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3,
  TrendingUp,
  MapPin,
  AlertTriangle,
  Clock,
  CheckCircle,
  Users,
  Building2,
  ArrowLeft,
  Star,
  Calendar,
  Activity,
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import api from '@/lib/apiClient';
import '@/styles/DashboardPage.css';

// Fix for default marker icons in React-Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  iconRetinaUrl: iconRetina,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const DashboardPage = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get('/issues/dashboard-stats');
        setDashboardData(response.data);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="dashboard-loading">
        <Activity size={48} className="pulse" />
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="dashboard-error">
        <AlertTriangle size={48} />
        <p>Failed to load dashboard data</p>
      </div>
    );
  }

  const {
    totalIssues,
    statusStats,
    severityStats,
    issueTypeStats,
    departmentStats,
    issuesWithLocations,
    avgResolutionDays,
    issuesOverTime,
    recurrenceStats,
    ratingStats,
  } = dashboardData;

  // Calculate percentages for severity
  const severityData = severityStats.map((item) => ({
    name: item._id,
    count: item.count,
    percentage: ((item.count / totalIssues) * 100).toFixed(1),
  }));

  // Status counts
  const statusData = statusStats.reduce((acc, item) => {
    acc[item._id] = item.count;
    return acc;
  }, {});

  // Map center (average of all locations or default)
  const mapCenter =
    issuesWithLocations.length > 0
      ? [
          issuesWithLocations.reduce((sum, i) => sum + i.geoLocation.latitude, 0) /
            issuesWithLocations.length,
          issuesWithLocations.reduce((sum, i) => sum + i.geoLocation.longitude, 0) /
            issuesWithLocations.length,
        ]
      : [28.6139, 77.209]; // Delhi default

  // Calculate bounds to fit all markers
  const getMapBounds = () => {
    if (issuesWithLocations.length === 0) return null;
    
    const latitudes = issuesWithLocations.map(i => i.geoLocation.latitude);
    const longitudes = issuesWithLocations.map(i => i.geoLocation.longitude);
    
    return [
      [Math.min(...latitudes), Math.min(...longitudes)], // Southwest corner
      [Math.max(...latitudes), Math.max(...longitudes)]  // Northeast corner
    ];
  };

  const mapBounds = getMapBounds();

  const getMarkerColor = (severity) => {
    switch (severity) {
      case 'critical':
        return 'red';
      case 'high':
        return 'orange';
      case 'medium':
        return 'yellow';
      case 'low':
        return 'green';
      default:
        return 'blue';
    }
  };

  return (
    <div className="dashboard-page">
      <button className="dashboard-back-btn" onClick={() => navigate('/')}>
        <ArrowLeft size={20} />
        <span>Back to Home</span>
      </button>
      
      <div className="dashboard-header">
        <div className="dashboard-title">
          <BarChart3 size={32} />
          <h1>Analytics Dashboard</h1>
        </div>
        <p className="dashboard-subtitle">
          Comprehensive overview of all civic complaints and resolutions
        </p>
      </div>

      {/* Key Metrics */}
      <div className="metrics-grid">
        <div className="metric-card glass fade-scale stagger-1">
          <div className="metric-icon" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <Activity size={24} />
          </div>
          <div className="metric-content">
            <div className="metric-value">{totalIssues}</div>
            <div className="metric-label">Total Issues</div>
          </div>
        </div>

        <div className="metric-card glass fade-scale stagger-2">
          <div className="metric-icon" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
            <CheckCircle size={24} />
          </div>
          <div className="metric-content">
            <div className="metric-value">{statusData.completed || 0}</div>
            <div className="metric-label">Completed</div>
          </div>
        </div>

        <div className="metric-card glass fade-scale stagger-3">
          <div className="metric-icon" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
            <Clock size={24} />
          </div>
          <div className="metric-content">
            <div className="metric-value">{avgResolutionDays}</div>
            <div className="metric-label">Avg. Resolution (days)</div>
          </div>
        </div>

        <div className="metric-card glass fade-scale stagger-4">
          <div className="metric-icon" style={{ background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)' }}>
            <Star size={24} />
          </div>
          <div className="metric-content">
            <div className="metric-value">{ratingStats.avgRating.toFixed(1)}</div>
            <div className="metric-label">Avg. Rating</div>
          </div>
        </div>
      </div>

      {/* Severity Breakdown */}
      <div className="dashboard-section">
        <h2 className="section-title">
          <AlertTriangle size={24} />
          Severity Distribution
        </h2>
        <div className="severity-pie-container glass">
          <div className="pie-chart-wrapper">
            <svg viewBox="0 0 100 100" className="pie-chart">
              {severityData.reduce((acc, severity, idx) => {
                const colors = {
                  critical: '#ef4444',
                  high: '#f97316',
                  medium: '#fbbf24',
                  low: '#10b981'
                };
                
                const percentage = parseFloat(severity.percentage);
                const angle = (percentage / 100) * 360;
                const startAngle = acc.currentAngle;
                const endAngle = startAngle + angle;
                
                // Calculate path for pie slice
                const x1 = 50 + 45 * Math.cos((Math.PI * startAngle) / 180);
                const y1 = 50 + 45 * Math.sin((Math.PI * startAngle) / 180);
                const x2 = 50 + 45 * Math.cos((Math.PI * endAngle) / 180);
                const y2 = 50 + 45 * Math.sin((Math.PI * endAngle) / 180);
                const largeArc = angle > 180 ? 1 : 0;
                
                acc.slices.push(
                  <path
                    key={idx}
                    d={`M 50 50 L ${x1} ${y1} A 45 45 0 ${largeArc} 1 ${x2} ${y2} Z`}
                    fill={colors[severity.name] || '#6366f1'}
                    stroke="white"
                    strokeWidth="0.5"
                    className="pie-slice"
                  />
                );
                
                acc.currentAngle = endAngle;
                return acc;
              }, { slices: [], currentAngle: -90 }).slices}
            </svg>
          </div>
          <div className="severity-legend">
            {severityData.map((severity, idx) => {
              const colors = {
                critical: '#ef4444',
                high: '#f97316',
                medium: '#fbbf24',
                low: '#10b981'
              };
              return (
                <div key={idx} className="legend-item">
                  <div 
                    className="legend-color" 
                    style={{ background: colors[severity.name] || '#6366f1' }}
                  ></div>
                  <div className="legend-info">
                    <span className="legend-label">{severity.name}</span>
                    <span className="legend-stats">
                      {severity.count} ({severity.percentage}%)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Status Overview */}
      <div className="dashboard-section">
        <h2 className="section-title">
          <TrendingUp size={24} />
          Status Overview
        </h2>
        <div className="status-grid">
          <div className="status-card glass pending">
            <AlertTriangle size={32} />
            <div className="status-value">{statusData.pending || 0}</div>
            <div className="status-label">Pending</div>
          </div>
          <div className="status-card glass in-review">
            <Clock size={32} />
            <div className="status-value">{statusData.in_review || 0}</div>
            <div className="status-label">In Review</div>
          </div>
          <div className="status-card glass completed">
            <CheckCircle size={32} />
            <div className="status-value">{statusData.completed || 0}</div>
            <div className="status-label">Completed</div>
          </div>
          <div className="status-card glass reopened">
            <Activity size={32} />
            <div className="status-value">{statusData.reopened || 0}</div>
            <div className="status-label">Reopened</div>
          </div>
        </div>
      </div>

      {/* Department Stats */}
      {departmentStats.length > 0 && (
        <div className="dashboard-section">
          <h2 className="section-title">
            <Building2 size={24} />
            Issues by Department
          </h2>
          <div className="chart-container glass">
            {departmentStats.map((dept, idx) => {
              const percentage = ((dept.count / totalIssues) * 100).toFixed(1);
              return (
                <div key={idx} className="bar-item">
                  <div className="bar-label">{dept._id}</div>
                  <div className="bar-wrapper">
                    <div
                      className="bar-fill"
                      style={{
                        width: `${percentage}%`,
                        background: `hsl(${idx * 36}, 70%, 60%)`,
                      }}
                    >
                      <span className="bar-value">{dept.count}</span>
                    </div>
                  </div>
                  <div className="bar-percent">{percentage}%</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Map */}
      {issuesWithLocations.length > 0 && (
        <div className="dashboard-section">
          <h2 className="section-title">
            <MapPin size={24} />
            Issue Locations Map ({issuesWithLocations.length} locations)
          </h2>
          <div className="map-container glass">
            <MapContainer
              center={mapCenter}
              zoom={issuesWithLocations.length === 1 ? 15 : 12}
              bounds={mapBounds}
              boundsOptions={{ padding: [50, 50] }}
              style={{ height: '500px', width: '100%', borderRadius: '12px' }}
              scrollWheelZoom={true}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              />
              {issuesWithLocations.map((issue, idx) => (
                <Marker
                  key={idx}
                  position={[issue.geoLocation.latitude, issue.geoLocation.longitude]}
                >
                  <Popup>
                    <div className="map-popup">
                      <strong>{issue.issueType}</strong>
                      <p>{issue.location}</p>
                      <span className={`popup-badge severity-${issue.severity}`}>
                        {issue.severity}
                      </span>
                      <span className={`popup-badge status-${issue.status}`}>
                        {issue.status}
                      </span>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>
      )}

      {/* Timeline */}
      {issuesOverTime.length > 0 && (
        <div className="dashboard-section">
          <h2 className="section-title">
            <Calendar size={24} />
            Issues Trend (Last 30 Days)
          </h2>
          <div className="timeline-container glass">
            <div className="timeline-chart">
              {issuesOverTime.map((day, idx) => {
                const maxCount = Math.max(...issuesOverTime.map((d) => d.count));
                const height = (day.count / maxCount) * 100;
                return (
                  <div key={idx} className="timeline-bar-wrapper">
                    <div
                      className="timeline-bar"
                      style={{ height: `${height}%` }}
                      title={`${day._id}: ${day.count} issues`}
                    >
                      <span className="timeline-value">{day.count}</span>
                    </div>
                    <div className="timeline-date">
                      {new Date(day._id).getDate()}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
