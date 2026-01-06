import { useEffect, useRef } from 'react';

// Global video controller - ensures only one video plays at a time
class GlobalVideoController {
  constructor() {
    this.videos = new Map(); // Track videos with their visibility state
    this.currentlyPlaying = null;
    this.modalOpen = false;
  }

  register(video, priority = 'normal') {
    this.videos.set(video, {
      priority,
      isVisible: false,
      element: video
    });
  }

  unregister(video) {
    this.videos.delete(video);
    if (this.currentlyPlaying === video) {
      this.currentlyPlaying = null;
    }
  }

  updateVisibility(video, isVisible) {
    const data = this.videos.get(video);
    if (data) {
      data.isVisible = isVisible;
    }

    // After updating visibility, determine which video should play
    this.updatePlayback();
  }

  updatePlayback() {
    // If modal is open, only play modal videos
    const videosToConsider = Array.from(this.videos.entries())
      .filter(([video, data]) => {
        if (this.modalOpen) {
          return data.priority === 'modal' && data.isVisible;
        }
        return data.isVisible;
      });

    // If no visible videos, pause current
    if (videosToConsider.length === 0) {
      if (this.currentlyPlaying) {
        this.currentlyPlaying.pause();
        this.currentlyPlaying = null;
      }
      return;
    }

    // Find the video closest to the center of the viewport
    const viewportCenter = (window.innerHeight || document.documentElement.clientHeight) / 2;

    videosToConsider.sort(([videoA], [videoB]) => {
      const rectA = videoA.getBoundingClientRect();
      const rectB = videoB.getBoundingClientRect();

      const centerA = rectA.top + rectA.height / 2;
      const centerB = rectB.top + rectB.height / 2;

      const distA = Math.abs(centerA - viewportCenter);
      const distB = Math.abs(centerB - viewportCenter);

      return distA - distB;
    });

    const [videoToPlay] = videosToConsider[0];

    // If it's already playing, do nothing
    if (this.currentlyPlaying === videoToPlay) {
      return;
    }

    // Pause current video if different
    if (this.currentlyPlaying && this.currentlyPlaying !== videoToPlay) {
      this.currentlyPlaying.pause();
    }

    // Play the selected video
    this.currentlyPlaying = videoToPlay;
    videoToPlay.play().catch(err => {
      console.debug('Autoplay prevented:', err);
    });
  }

  setModalOpen(isOpen) {
    this.modalOpen = isOpen;
    if (isOpen) {
      // Pause all feed videos when modal opens
      this.videos.forEach((data, video) => {
        if (data.priority !== 'modal' && !video.paused) {
          video.pause();
        }
      });

      // Clear currently playing if it's a feed video
      if (this.currentlyPlaying) {
        const currentData = this.videos.get(this.currentlyPlaying);
        if (currentData && currentData.priority !== 'modal') {
          this.currentlyPlaying = null;
        }
      }

      // Update playback to play modal video if visible
      this.updatePlayback();
    } else {
      // When modal closes, update playback for feed videos
      this.updatePlayback();
    }
  }

  pauseAll() {
    this.videos.forEach((data, video) => {
      if (!video.paused) {
        video.pause();
      }
    });
    this.currentlyPlaying = null;
  }
}

// Singleton instance
const globalController = new GlobalVideoController();

export const useVideoVisibility = (options = {}) => {
  const videoRef = useRef(null);
  const observerRef = useRef(null);
  const { threshold = 0.5, priority = 'normal' } = options;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Register with global controller
    globalController.register(video, priority);

    const observerOptions = {
      threshold,
      rootMargin: '0px',
    };

    const handleIntersection = (entries) => {
      entries.forEach((entry) => {
        // Update visibility state in global controller
        globalController.updateVisibility(video, entry.isIntersecting);
      });
    };

    observerRef.current = new IntersectionObserver(handleIntersection, observerOptions);
    observerRef.current.observe(video);

    // IMPORTANT: Check initial visibility after a short delay
    // This ensures videos autoplay on page load
    const initialCheckTimer = setTimeout(() => {
      const rect = video.getBoundingClientRect();
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

      // Check if video is in viewport
      const isVisible = (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= viewportHeight &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
      ) || (
          // Also check if threshold amount is visible
          rect.top < viewportHeight &&
          rect.bottom > 0 &&
          (viewportHeight - rect.top) / rect.height >= threshold
        );

      if (isVisible) {
        globalController.updateVisibility(video, true);
      }
    }, 100);

    // Listen to play events to ensure coordination
    const handlePlay = () => {
      // When user manually plays a video, update the controller
      const data = globalController.videos.get(video);
      if (data) {
        data.isVisible = true;
        globalController.updatePlayback();
      }
    };

    video.addEventListener('play', handlePlay);

    return () => {
      clearTimeout(initialCheckTimer);
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      video.removeEventListener('play', handlePlay);
      globalController.unregister(video);
    };
  }, [threshold, priority]);

  return videoRef;
};

// Hook for modals to notify global controller
export const useModalVideoController = (isOpen) => {
  useEffect(() => {
    globalController.setModalOpen(isOpen);

    // When modal opens, trigger an immediate playback update
    // This ensures modal videos start playing right away
    if (isOpen) {
      setTimeout(() => {
        globalController.updatePlayback();
      }, 150);
    }
  }, [isOpen]);
};
