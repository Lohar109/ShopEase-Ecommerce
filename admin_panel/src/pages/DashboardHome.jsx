import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Users, Package, ShoppingBag, IndianRupee } from 'lucide-react';
import { getDashboardStats } from '../services/dashboardService';

const cardStyle = {
  background: '#ffffff',
  borderRadius: 12,
  boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
  padding: 22,
  boxSizing: 'border-box',
};

const formatCurrency = (value) => {
  const num = Number(value) || 0;
  return `₹${num.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
};

const formatDate = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const statusColors = {
  paid: { bg: '#dcfce7', color: '#22c55e', label: 'Paid' },
  captured: { bg: '#dcfce7', color: '#22c55e', label: 'Captured' },
  failed: { bg: '#fee2e2', color: '#ef4444', label: 'Failed' },
  created: { bg: '#fef3c7', color: '#d97706', label: 'Pending' },
  pending: { bg: '#fef3c7', color: '#d97706', label: 'Pending' },
};

const StatusBadge = ({ status }) => {
  const normalized = String(status || '').toLowerCase();
  const style = statusColors[normalized] || { bg: '#f4f4f5', color: '#71717a', label: status || '-' };
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '3px 10px',
        borderRadius: 999,
        background: style.bg,
        color: style.color,
        fontSize: 11,
        fontWeight: 700,
        textTransform: 'capitalize',
      }}
    >
      {style.label}
    </span>
  );
};

const StatCard = ({ icon: Icon, label, value, sublabel, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35, delay }}
    style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: 12, minWidth: 0 }}
  >
    <div
      style={{
        width: 40,
        height: 40,
        borderRadius: 10,
        background: 'rgba(200, 80, 122, 0.10)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Icon size={20} color="#c8507a" />
    </div>
    <div>
      <div style={{ fontSize: 26, fontWeight: 700, color: '#111827', fontFamily: 'Poppins, sans-serif', lineHeight: 1.2 }}>
        {value}
      </div>
      <div style={{ fontSize: 13, color: '#71717a', fontWeight: 500, marginTop: 2 }}>{label}</div>
      {sublabel ? (
        <div style={{ fontSize: 12, color: '#c8507a', fontWeight: 600, marginTop: 6 }}>{sublabel}</div>
      ) : null}
    </div>
  </motion.div>
);

const PanelCard = ({ title, children, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35, delay }}
    style={{ ...cardStyle, flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}
  >
    <h3
      style={{
        margin: 0,
        marginBottom: 16,
        fontFamily: 'Poppins, sans-serif',
        fontSize: 15,
        fontWeight: 600,
        color: '#111827',
      }}
    >
      {title}
    </h3>
    {children}
  </motion.div>
);

const EmptyState = ({ message }) => (
  <div
    style={{
      padding: '32px 16px',
      textAlign: 'center',
      color: '#71717a',
      fontSize: 13,
      fontFamily: 'Poppins, sans-serif',
    }}
  >
    {message}
  </div>
);

const SkeletonBlock = ({ height = 14, width = '100%' }) => (
  <div
    style={{
      height,
      width,
      borderRadius: 6,
      background: '#e4e4e7',
      animation: 'dashboard-pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
    }}
  />
);

const DashboardHome = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;

    const loadStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getDashboardStats();
        if (!active) return;
        setStats(data);
      } catch (err) {
        if (!active) return;
        setError(err);
        toast.error(err.message || 'Failed to load dashboard stats');
      } finally {
        if (active) setLoading(false);
      }
    };

    loadStats();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, width: '100%', boxSizing: 'border-box' }}>
      <style>{`
        @keyframes dashboard-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .5; }
        }
        .dashboard-stat-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
        }
        .dashboard-panel-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        @media (max-width: 900px) {
          .dashboard-stat-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .dashboard-panel-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {error ? (
        <div style={{ ...cardStyle }}>
          <p style={{ margin: 0, color: '#111827', fontSize: 14, fontWeight: 600 }}>Failed to load dashboard</p>
          <p style={{ margin: '6px 0 0', color: '#71717a', fontSize: 13 }}>
            {error.status === 401
              ? 'Your session has expired. Please log in again.'
              : (error.message || 'Something went wrong while fetching dashboard data.')}
          </p>
        </div>
      ) : (
        <>
          <div className="dashboard-stat-grid">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <SkeletonBlock height={40} width={40} />
                  <SkeletonBlock height={26} width="60%" />
                  <SkeletonBlock height={13} width="40%" />
                </div>
              ))
            ) : (
              <>
                <StatCard
                  icon={Users}
                  label="Total Users"
                  value={(stats?.totalUsers ?? 0).toLocaleString('en-IN')}
                  sublabel={stats?.signupsLast7Days > 0 ? `+${stats.signupsLast7Days} this week` : null}
                  delay={0}
                />
                <StatCard
                  icon={Package}
                  label="Total Products"
                  value={(stats?.totalProducts ?? 0).toLocaleString('en-IN')}
                  delay={0.05}
                />
                <StatCard
                  icon={ShoppingBag}
                  label="Total Orders"
                  value={(stats?.totalOrders ?? 0).toLocaleString('en-IN')}
                  delay={0.1}
                />
                <StatCard
                  icon={IndianRupee}
                  label="Total Revenue"
                  value={formatCurrency(stats?.totalRevenue)}
                  delay={0.15}
                />
              </>
            )}
          </div>

          <div className="dashboard-panel-grid">
            <PanelCard title="Recent Signups" delay={0.2}>
              {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {Array.from({ length: 4 }).map((_, i) => (
                    <SkeletonBlock key={i} height={16} />
                  ))}
                </div>
              ) : !stats?.recentSignups?.length ? (
                <EmptyState message="No signups yet." />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {stats.recentSignups.map((user) => {
                    const name = [user.first_name, user.last_name].filter(Boolean).join(' ');
                    return (
                      <div
                        key={user.id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '10px 0',
                          borderBottom: '1px solid #f4f4f5',
                          gap: 12,
                        }}
                      >
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {name || user.email}
                          </div>
                          <div style={{ fontSize: 12, color: '#71717a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {user.email}
                          </div>
                        </div>
                        <div style={{ fontSize: 12, color: '#71717a', whiteSpace: 'nowrap', flexShrink: 0 }}>
                          {formatDate(user.created_at)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </PanelCard>

            <PanelCard title="Recent Orders" delay={0.25}>
              {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {Array.from({ length: 4 }).map((_, i) => (
                    <SkeletonBlock key={i} height={16} />
                  ))}
                </div>
              ) : !stats?.recentOrders?.length ? (
                <EmptyState message="No orders yet." />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {stats.recentOrders.map((order) => {
                    const ref = String(order.razorpay_order_id || '').slice(-8);
                    return (
                      <div
                        key={order.id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '10px 0',
                          borderBottom: '1px solid #f4f4f5',
                          gap: 12,
                        }}
                      >
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>#{ref}</div>
                          <div style={{ fontSize: 12, color: '#71717a' }}>{formatDate(order.created_at)}</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                          <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>
                            {formatCurrency(order.amount)}
                          </span>
                          <StatusBadge status={order.status} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </PanelCard>
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardHome;
