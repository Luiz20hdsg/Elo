import { OneSignal } from 'react-native-onesignal';
import { supabase } from './supabase';
import { Alert, Platform } from 'react-native';
import { ONESIGNAL_APP_ID } from 'react-native-dotenv';

class NotificationService {
  public init(): void {
    // Initialize OneSignal with App ID from env
    OneSignal.initialize(ONESIGNAL_APP_ID);

    // Request push notification permission (prompts on iOS)
    OneSignal.Notifications.requestPermission(true);

    // Add event listeners
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    // Handle notification received while app is in foreground
    OneSignal.Notifications.addEventListener('foregroundWillDisplay', (event: any) => {
      console.log('OneSignal: notification will show in foreground:', event.notification);
      // Display the notification
      event.preventDefault();
      event.getNotification().display();
    });

    // Handle notification clicked/opened
    OneSignal.Notifications.addEventListener('click', (event: any) => {
      console.log('OneSignal: notification clicked:', event);
      // Handle navigation or other actions based on notification data
    });
  }

  public async getAndSaveDeviceToken(): Promise<void> {
    const pushSubscription = OneSignal.User.pushSubscription;
    const token = pushSubscription.getPushSubscriptionId();

    if (!token) {
      console.error('OneSignal: Could not get push subscription ID.');
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.log('NotificationService: User not logged in, skipping token save.');
      return;
    }

    const platform = Platform.OS === 'ios' ? 'apn' : 'fcm';

    console.log(`Saving push token ${token} for user ${user.id} on platform ${platform}`);

    // Also set external user ID in OneSignal for targeting
    OneSignal.login(user.id);

    const { error } = await supabase
      .from('push_tokens')
      .upsert(
        {
          user_id: user.id,
          token: token,
          platform: platform,
        },
        { onConflict: 'user_id, token' }
      );

    if (error) {
      console.error('Error saving push token:', error);
      Alert.alert('Erro', 'Não foi possível registrar o dispositivo para notificações.');
    }
  }

  public async removeDeviceTokenOnLogout(): Promise<void> {
    const pushSubscription = OneSignal.User.pushSubscription;
    const token = pushSubscription.getPushSubscriptionId();

    if (!token) {
      return;
    }

    const { error } = await supabase
      .from('push_tokens')
      .delete()
      .eq('token', token);

    if (error) {
      console.error('Error removing push token on logout:', error);
    } else {
      console.log('Push token removed successfully on logout.');
    }

    // Logout from OneSignal
    OneSignal.logout();
  }
}

// Export a singleton instance
export const notificationService = new NotificationService();
