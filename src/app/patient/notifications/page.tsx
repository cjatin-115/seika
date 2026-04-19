'use client';

import { useState, useEffect } from 'react';
import { colors } from '@/lib/constants';
import { Trash2, CheckCircle, AlertCircle, Info } from 'lucide-react';
import Card from '@/components/shared/Card';
import PrimaryButton from '@/components/shared/PrimaryButton';
import SectionHeader from '@/components/shared/SectionHeader';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'APPOINTMENT' | 'REMINDER' | 'ALERT' | 'INFO';
  read: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.data?.notifications || []);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const res = await fetch(`/api/notifications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ read: true }),
      });

      if (res.ok) {
        setNotifications(
          notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          )
        );
      }
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const res = await fetch(`/api/notifications/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setNotifications(notifications.filter((n) => n.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const getIconAndColor = (type: string) => {
    switch (type) {
      case 'APPOINTMENT':
        return { icon: CheckCircle, color: '#10b981' };
      case 'REMINDER':
        return { icon: AlertCircle, color: '#f59e0b' };
      case 'ALERT':
        return { icon: AlertCircle, color: '#ef4444' };
      case 'INFO':
        return { icon: Info, color: '#6366f1' };
      default:
        return { icon: Info, color: colors.accentCherry };
    }
  };

  const filteredNotifications =
    filter === 'unread'
      ? notifications.filter((n) => !n.read)
      : notifications;

  return (
    <div className="px-4 py-6 md:px-8 md:py-8 max-w-4xl mx-auto">
      <SectionHeader title="Notifications" subtitle="Stay updated on appointments and reminders" />

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        <PrimaryButton
          onClick={() => setFilter('all')}
          variant={filter === 'all' ? 'primary' : 'secondary'}
        >
          All ({notifications.length})
        </PrimaryButton>
        <PrimaryButton
          onClick={() => setFilter('unread')}
          variant={filter === 'unread' ? 'primary' : 'secondary'}
        >
          Unread ({notifications.filter((n) => !n.read).length})
        </PrimaryButton>
      </div>

      {/* Notifications List */}
      {loading ? (
        <Card className="text-center py-12 rounded-xl">
          <div
            className="w-12 h-12 border-4 border-transparent rounded-full animate-spin mx-auto mb-4"
            style={{ borderTopColor: colors.accentCherry }}
          ></div>
          <p style={{ color: colors.textSecondary }}>Loading notifications...</p>
        </Card>
      ) : filteredNotifications.length === 0 ? (
        <Card className="text-center py-12 rounded-xl">
          <p style={{ color: colors.textSecondary }}>
            {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notification) => {
            const { icon: Icon, color } = getIconAndColor(notification.type);
            return (
              <Card
                key={notification.id}
                onClick={() => !notification.read && markAsRead(notification.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  !notification.read ? 'border-blue-200' : ''
                }`}
                style={{
                  backgroundColor: !notification.read ? '#f0f9ff' : colors.surface,
                  borderColor: colors.border,
                }}
              >
                <div className="flex items-start gap-4">
                  <div
                    className="p-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: `${color}20` }}
                  >
                    <Icon size={20} color={color} />
                  </div>

                  <div className="flex-1">
                    <h3
                      style={{ color: colors.textPrimary }}
                      className="font-semibold mb-1"
                    >
                      {notification.title}
                    </h3>
                    <p style={{ color: colors.textSecondary }} className="text-sm mb-2">
                      {notification.message}
                    </p>
                    <p style={{ color: colors.textSecondary }} className="text-xs">
                      {new Date(notification.createdAt).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>

                  <PrimaryButton
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(notification.id);
                    }}
                    variant="secondary"
                    className="h-9 w-9 min-h-0 rounded-lg p-0 flex-shrink-0"
                  >
                    <Trash2 size={16} />
                  </PrimaryButton>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
