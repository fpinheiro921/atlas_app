import { db } from './firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { AccountStatus, UserSubscription } from '../types';

const TRIAL_LENGTH_DAYS = 7;

/**
 * Creates a new trial subscription for a user
 */
export const createTrialSubscription = async (userId: string, email: string): Promise<UserSubscription> => {
    const now = new Date();
    const trialEndsAt = new Date(now);
    trialEndsAt.setDate(now.getDate() + TRIAL_LENGTH_DAYS);

    const subscription: UserSubscription = {
        accountStatus: AccountStatus.TRIAL,
        email,
        trialStartDate: now.toISOString(),
        trialEndsAt: trialEndsAt.toISOString()
    };

    const userDocRef = doc(db, 'users', userId);
    await updateDoc(userDocRef, { subscription });

    return subscription;
};

/**
 * Activates a paid subscription for a user
 */
export const activateSubscription = async (
    userId: string,
    gumroadId: string,
    subscriptionType: 'monthly' | 'annual'
): Promise<UserSubscription> => {
    const userDocRef = doc(db, 'users', userId);
    const docSnap = await getDoc(userDocRef);
    
    if (!docSnap.exists()) {
        throw new Error('User not found');
    }

    const userData = docSnap.data();
    const currentSubscription = userData.subscription as UserSubscription;

    // Calculate next billing date based on subscription type
    const nextBillingDate = new Date();
    if (subscriptionType === 'annual') {
        nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);
    } else {
        nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
    }

    const updatedSubscription: UserSubscription = {
        ...currentSubscription,
        accountStatus: AccountStatus.ACTIVE,
        gumroadId,
        subscriptionType,
        nextBillingDate: nextBillingDate.toISOString()
    };

    await updateDoc(userDocRef, { subscription: updatedSubscription });

    return updatedSubscription;
};

/**
 * Expires a user's trial or subscription
 */
export const expireSubscription = async (userId: string): Promise<void> => {
    const userDocRef = doc(db, 'users', userId);
    const docSnap = await getDoc(userDocRef);
    
    if (!docSnap.exists()) {
        throw new Error('User not found');
    }

    const userData = docSnap.data();
    const currentSubscription = userData.subscription as UserSubscription;

    const updatedSubscription: UserSubscription = {
        ...currentSubscription,
        accountStatus: AccountStatus.EXPIRED,
        gumroadId: undefined,
        subscriptionType: undefined,
        nextBillingDate: undefined
    };

    await updateDoc(userDocRef, { subscription: updatedSubscription });
};

/**
 * Checks if a trial has expired
 */
export const isTrialExpired = (subscription: UserSubscription): boolean => {
    if (subscription.accountStatus !== AccountStatus.TRIAL) {
        return false; // Not relevant for non-trial accounts
    }

    const trialEnd = new Date(subscription.trialEndsAt);
    const now = new Date();
    return now > trialEnd;
};

/**
 * Gets the number of days remaining in the trial
 */
export const getTrialDaysRemaining = (subscription: UserSubscription): number => {
    if (subscription.accountStatus !== AccountStatus.TRIAL) {
        return 0;
    }

    const trialEnd = new Date(subscription.trialEndsAt);
    const now = new Date();
    const diffTime = trialEnd.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
};
