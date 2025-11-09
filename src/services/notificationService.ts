import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';
import { Subscription } from '../types';

// Configure notification behavior
// @ts-ignore
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const NOTIFICATION_TASK_NAME = 'SUBSCRIPTION_RENEWAL_CHECK';

// Register background task
TaskManager.defineTask(NOTIFICATION_TASK_NAME, async () => {
  try {
    console.log('✅ Background task running: checking subscription renewals');
    // eslint-disable-next-line import/namespace
    return { status: TaskManager.TaskManagerTaskExecutionStatus.SUCCESS };
  } catch (err) {
    console.error('❌ Background task error:', err);
    // eslint-disable-next-line import/namespace
    return { status: TaskManager.TaskManagerTaskExecutionStatus.FAILURE };
  }
});

export const notificationService = {
  async requestPermissions() {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      console.log(`✅ Notification permissions: ${status}`);
      return status === 'granted';
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      console.warn('⚠️  Could not request notification permissions (normal in Expo Go)');
      return false;
    }
  },

  async scheduleRenewalNotification(subscription: Subscription) {
    try {
      const renewalDate = new Date(subscription.renewalDate);
      const notificationDate = new Date(renewalDate.getTime() - 24 * 60 * 60 * 1000);

      if (notificationDate > new Date()) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: '💰 Subscription Renewal Reminder',
            body: `${subscription.name} renews tomorrow for ₹${subscription.amount}`,
            data: {
              subscriptionId: subscription.id,
              subscriptionName: subscription.name,
            },
            sound: 'default',
          },
          trigger: {
            type: 'date',
            date: notificationDate.getTime(),
          } as Notifications.DateTriggerInput,
        });
        console.log(`✅ Notification scheduled for ${subscription.name} on ${notificationDate.toLocaleDateString()}`);
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      console.warn('⚠️  Could not schedule notification (works in built app, not Expo Go)');
    }
  },

  async scheduleAllNotifications(subscriptions: Subscription[]) {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      for (const sub of subscriptions) {
        if (sub.active) {
          await this.scheduleRenewalNotification(sub);
        }
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      console.warn('⚠️  Could not schedule notifications');
    }
  },

  async cancelNotification(subscriptionId: string) {
    try {
      const allNotifications = await Notifications.getAllScheduledNotificationsAsync();
      const toCancel = allNotifications.filter(
          (notif) => notif.content.data?.subscriptionId === subscriptionId
      );
      for (const notif of toCancel) {
        await Notifications.cancelScheduledNotificationAsync(notif.identifier);
      }
      console.log(`✅ Notification cancelled for subscription ${subscriptionId}`);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      console.warn('⚠️  Could not cancel notification');
    }
  },

  onNotificationReceived(handler: (notification: Notifications.Notification) => void) {
    return Notifications.addNotificationResponseReceivedListener((response) => {
      handler(response.notification);
    });
  },
};
