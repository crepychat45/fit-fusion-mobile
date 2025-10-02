// Lazy loading utilities for route-based code splitting
import { lazy } from 'react';

// Lazy load page components to reduce initial bundle size
export const LazyIndex = lazy(() => import('@/pages/Index'));
export const LazyWorkouts = lazy(() => import('@/pages/workouts'));
export const LazyWorkoutDetail = lazy(() => import('@/pages/workout-detail'));
export const LazyExerciseDetail = lazy(() => import('@/pages/exercise-detail'));
export const LazyProgress = lazy(() => import('@/pages/progress'));
export const LazyProfile = lazy(() => import('@/pages/profile'));
export const LazySettings = lazy(() => import('@/pages/settings'));
export const LazyChat = lazy(() => import('@/pages/chat'));
export const LazyWearables = lazy(() => import('@/pages/wearables'));
export const LazySubscription = lazy(() => import('@/pages/subscription'));
export const LazyNotifications = lazy(() => import('@/pages/notifications'));
export const LazyHelp = lazy(() => import('@/pages/help'));
export const LazyExportData = lazy(() => import('@/pages/export-data'));
export const LazyPrivacyPolicy = lazy(() => import('@/pages/privacy-policy'));
export const LazyPrivacy = lazy(() => import('@/pages/privacy'));
export const LazyTermsOfService = lazy(() => import('@/pages/terms-of-service'));
export const LazyResetPassword = lazy(() => import('@/pages/reset-password'));
export const LazyNotFound = lazy(() => import('@/pages/NotFound'));
