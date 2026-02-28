import webPush from 'web-push';
import prisma from '../config/prisma.js';


webPush.setVapidDetails(
  process.env.VAPID_SUBJECT,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);


export const saveSubscription = async (req, res, next) => {
  try {
    const { subscription } = req.body; // { endpoint, keys: {p256dh, auth} }
    const userId = req.user.id; // Assume auth middleware sets req.user
    await prisma.pushSubscription.upsert({
      where: { endpoint: subscription.endpoint },
      update: { keys: subscription.keys, userId },
      create: { userId, endpoint: subscription.endpoint, keys: subscription.keys },
    });
    res.status(200).json({ success: true, message: 'Subscription saved' });
  } catch (error) {
    console.log(error)
    next(error);
  }
};

// Function to send push (reusable)
const sendPush = async (userId, title, body, data = {}) => {
  const subs = await prisma.pushSubscription.findMany({ where: { userId } });
  for (const sub of subs) {
    try {
      await webPush.sendNotification(sub, JSON.stringify({ title, body, data }));
    } catch (err) {
      if (err.statusCode === 410) { // Gone, delete sub
        await prisma.pushSubscription.delete({ where: { id: sub.id } });
      }
    }
  }
};

// Create and send notification (for system events)
export const createNotification = async (userId, title, body, data = {}) => {
  await prisma.userNotification.create({ data: { userId, title, body, data } });
  await sendPush(userId, title, body, data);
};

export const createRentalRequest = async (req, res, next) => {
  try {
    // Your existing code to create request...
    // After creating request and sending email (as fallback):
    const title = 'New Rental Request';
    const body = 'You have received a rental request. Check your dashboard.';
    const data = { url: '/dashboard/received-requests' };
    await createNotification(result.owner.id, title, body, data); // Send to owner
    // Rest of your code...
  } catch (error) {
    console.log(error)
    next(error);
  }
};

// For admin custom send
export const sendCustomNotification = async (req, res, next) => {
  try {
    const { title, body, targets, url = '/' } = req.body; // targets: 'all' or array of userIds/emails
    let userIds = [];
    if (targets === 'all') {
      const users = await prisma.user.findMany({ select: { id: true } });
      userIds = users.map(u => u.id);
    } else {
      // targets is array of emails or ids
      const idPromises = targets.map(async t => {
        const user = await prisma.user.findFirst({ where: { OR: [{ id: t }, { email: t }] } });
        return user?.id;
      });
      const resolvedIds = await Promise.all(idPromises);
      userIds = resolvedIds.filter(id => id);
    }

    for (const userId of userIds) {
      const data = { url };
      await prisma.userNotification.create({ data: { userId, title, body, data } });
      await sendPush(userId, title, body, data);
    }

    // Log for admin history
    await prisma.sentNotification.create({
      data: { title, body, targets: targets === 'all' ? 'all' : targets.join(',') }
    });

    res.status(200).json({ success: true, message: 'Notifications sent' });
  } catch (error) {
    console.log(error)
    next(error);
  }
};

// Get past sent for admin
export const getSentNotifications = async (req, res, next) => {
  try {
    const notifications = await prisma.sentNotification.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.status(200).json({ success: true, data: notifications });
  } catch (error) {
    console.log(error)
    next(error);
  }
};

// For user: Get notifications
export const getUserNotifications = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const notifications = await prisma.userNotification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    res.status(200).json({ success: true, data: notifications });
  } catch (error) {
    console.log(error)
    next(error);
  }
};

// Mark as read
export const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.userNotification.update({
      where: { id },
      data: { isRead: true },
    });
    res.status(200).json({ success: true });
  } catch (error) {
    console.log(error)
    next(error);
  }
};

export const notifyAdmins = async (title, body, data = { url: '/' }) => {
  try {
    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { id: true }
    });

    if (!admins.length) {
      console.warn('No admins found to notify.');
      return;
    }

    for (const admin of admins) {
      await prisma.userNotification.create({
        data: {
          userId: admin.id,
          title,
          body,
          data
        }
      });
      await sendPush(admin.id, title, body, data);
    }

    // Optionally log in admin history table if you have one
    await prisma.sentNotification.create({
      data: {
        title,
        body,
        targets: 'admins'
      }
    });

    console.log(`✅ Notification sent to ${admins.length} admin(s).`);
  } catch (error) {
    console.error('Failed to send admin notification:', error);
  }
};
