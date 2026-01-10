import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import toast, { Toaster } from "react-hot-toast";
import { translateNotificationMessage } from "@/utils/notificationText";

const INITIAL_LOAD = 100;
const PAGE_SIZE = 40;
const TOTAL_ITEMS = 240;

function generateMockNotifications(total = TOTAL_ITEMS) {
  const now = new Date();
  const messages = [
    "আপনাকে ফলো করেছে !",
    "আপনাকে আন-ফলো করেছে !",
    "আপনার পোস্ট এ লাইক দিয়েছে !",
    "আপনার পোস্ট এ আন-লাইক দিয়েছে !",
    "আপনার পোস্ট এ মন্তব্য করেছে !",
  ];

  return Array.from({ length: total }, (_, index) => {
    const id = total - index;
    const deltaMinutes = index * 17;
    const createdAt = new Date(now.getTime() - deltaMinutes * 60 * 1000);
    return {
      id,
      toUserId: 1 + ((index * 7) % 100),
      fromUserId: 5 + ((index * 11) % 120),
      postId: index % 5 === 0 ? 0 : 40 + ((index * 3) % 160),
      readStatus: index % 3 === 0 ? 1 : 0,
      message: messages[index % messages.length],
      createdAt,
    };
  });
}

function formatTimestamp(date) {
  const time = date.toLocaleTimeString("bn-BD", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const formattedDate = date
    .toLocaleDateString("bn-BD", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
    .replace(/\//g, ", ");
  return `${time}  (${formattedDate})`;
}

function TrashIcon({ size = 24, color = "currentColor" }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke={color}
      strokeLinejoin="round"
    >
      <path
        d="M19.5 5.5L18.8803 15.5251C18.7219 18.0864 18.6428 19.3671 18.0008 20.2879C17.6833 20.7431 17.2747 21.1273 16.8007 21.416C15.8421 22 14.559 22 11.9927 22C9.42312 22 8.1383 22 7.17905 21.4149C6.7048 21.1257 6.296 20.7408 5.97868 20.2848C5.33688 19.3626 5.25945 18.0801 5.10461 15.5152L4.5 5.5"
        strokeLinecap="round"
        strokeWidth="1.5"
      />
      <path
        d="M3 5.5H21M16.0557 5.5L15.3731 4.09173C14.9196 3.15626 14.6928 2.68852 14.3017 2.39681C14.215 2.3321 14.1231 2.27454 14.027 2.2247C13.5939 2 13.0741 2 12.0345 2C10.9688 2 10.436 2 9.99568 2.23412C9.8981 2.28601 9.80498 2.3459 9.71729 2.41317C9.32164 2.7167 9.10063 3.20155 8.65861 4.17126L8.05292 5.5"
        strokeLinecap="round"
        strokeWidth="1.5"
      />
      <path
        d="M9.5 16.5L9.5 10.5"
        strokeLinecap="round"
        strokeWidth="1.5"
      />
      <path
        d="M14.5 16.5L14.5 10.5"
        strokeLinecap="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}

export default function ManageNotificationsPage() {
  const [notifications, setNotifications] = useState(() =>
    generateMockNotifications(TOTAL_ITEMS)
  );
  const [visibleCount, setVisibleCount] = useState(() =>
    Math.min(INITIAL_LOAD, TOTAL_ITEMS)
  );
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [showConfirm, setShowConfirm] = useState(false);
  const sentinelRef = useRef(null);
  const loadingRef = useRef(false);

  const visibleNotifications = useMemo(
    () => notifications.slice(0, visibleCount),
    [notifications, visibleCount]
  );

  const totalCount = notifications.length;
  const hasMore = visibleCount < totalCount;

  const handleSelectOne = useCallback((id, checked) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  }, []);

  const handleSelectAllVisible = useCallback(
    (checked) => {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        visibleNotifications.forEach((item) => {
          if (checked) {
            next.add(item.id);
          } else {
            next.delete(item.id);
          }
        });
        return next;
      });
    },
    [visibleNotifications]
  );

  const allVisibleSelected =
    visibleNotifications.length > 0 &&
    visibleNotifications.every((item) => selectedIds.has(item.id));

  const requestDeleteSelected = useCallback(() => {
    if (!selectedIds.size) {
      toast.error("মুছতে কমপক্ষে একটি বিজ্ঞপ্তি নির্বাচন করুন।");
      return;
    }
    setShowConfirm(true);
  }, [selectedIds.size]);

  const confirmDeleteSelected = useCallback(() => {
    if (!selectedIds.size) {
      setShowConfirm(false);
      return;
    }
    setNotifications((prev) =>
      prev.filter((item) => !selectedIds.has(item.id))
    );
    setSelectedIds(new Set());
    setShowConfirm(false);
    toast.success("নির্বাচিত বিজ্ঞপ্তি মুছে ফেলা হয়েছে।");
  }, [selectedIds]);

  const cancelDelete = useCallback(() => {
    setShowConfirm(false);
  }, []);

  useEffect(() => {
    setVisibleCount((prev) => Math.min(prev, notifications.length));
    setSelectedIds((prev) => {
      if (!prev.size) return prev;
      const existingIds = new Set(notifications.map((item) => item.id));
      const next = new Set(
        Array.from(prev).filter((id) => existingIds.has(id))
      );
      return next;
    });
  }, [notifications]);

  const loadMore = useCallback(() => {
    if (loadingRef.current || !hasMore) return;
    loadingRef.current = true;
    setVisibleCount((prev) =>
      Math.min(prev + PAGE_SIZE, notifications.length)
    );
    requestAnimationFrame(() => {
      loadingRef.current = false;
    });
  }, [hasMore, notifications.length]);

  useEffect(() => {
    const element = sentinelRef.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { root: null, rootMargin: "0px", threshold: 0.25 }
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [loadMore]);

  return (
    <>
      <div className="content-wrapper _scoped_admin" style={{ minHeight: "839px" }}>
      <div className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1 className="m-0">সব বিজ্ঞপ্তি ব্যবস্থাপনা</h1>
            </div>
            <div className="col-sm-6">
              <ol className="breadcrumb float-sm-right" />
            </div>
          </div>
        </div>
      </div>

      <section className="content">
        <div className="container-fluid">
          <div className="row">
            <div className="card w-100 card-notification">
              <div className="card-header d-flex align-items-center justify-content-between flex-wrap gap-2">
                <h3>মোট বিজ্ঞপ্তি = [{totalCount}]</h3>
              </div>

              <div className="card-body">
                <div className="notifi mb-3 d-flex align-items-center gap-3 flex-wrap">
                  <button
                    type="button"
                    className={`delete-action ${
                      selectedIds.size ? "" : "is-inactive"
                    }`}
                    onClick={requestDeleteSelected}
                    title="নির্বাচিত মুছুন"
                    aria-disabled={!selectedIds.size}
                    disabled={!selectedIds.size}
                  >
                    <TrashIcon size={18} color="currentColor" />
                  </button>
                  &nbsp;
                  <span className="text-muted small">
                    {selectedIds.size
                      ? `নির্বাচিত ${selectedIds.size} টি`
                      : "মুছতে বিজ্ঞপ্তি নির্বাচন করুন"}
                  </span>
                </div>

                <form>
                  <div className="table-responsive">
                    <table className="table table-bordered table-hover table-sm mb-0 align-middle text-nowrap">
                      <thead>
                        <tr>
                          <th style={{ width: 48, textAlign: "center" }}>
                            <input
                              type="checkbox"
                              checked={allVisibleSelected}
                              onChange={(event) =>
                                handleSelectAllVisible(event.target.checked)
                              }
                              aria-label="সব দৃশ্যমান বিজ্ঞপ্তি নির্বাচন করুন"
                              className="notification-checkbox"
                            />
                          </th>
                          <th className="small fw-semibold text-uppercase text-muted">
                            আইডি
                          </th>
                          <th className="small fw-semibold text-uppercase text-muted">
                            প্রাপক আইডি
                          </th>
                          <th className="small fw-semibold text-uppercase text-muted">
                            প্রেরক আইডি
                          </th>
                          <th className="small fw-semibold text-uppercase text-muted">
                            পোস্ট আইডি
                          </th>
                          <th className="small fw-semibold text-uppercase text-muted">
                            পড়া হয়েছে
                          </th>
                          <th className="small fw-semibold text-uppercase text-muted">
                            বিজ্ঞপ্তি
                          </th>
                          <th className="small fw-semibold text-uppercase text-muted">
                            সময়
                          </th>
                        </tr>
                      </thead>
                      <tbody className="small">
                        {visibleNotifications.map((notification) => (
                          <tr key={notification.id} id={`box${notification.id}`}>
                            <td style={{ textAlign: "center" }}>
                              <input
                                type="checkbox"
                                checked={selectedIds.has(notification.id)}
                                onChange={(event) =>
                                  handleSelectOne(
                                    notification.id,
                                    event.target.checked
                                  )
                                }
                                aria-label={`বিজ্ঞপ্তি নির্বাচন করুন ${notification.id}`}
                                className="notification-checkbox"
                              />
                            </td>
                            <td className="text-secondary">{notification.id}</td>
                            <td className="text-secondary">
                              {notification.toUserId}
                            </td>
                            <td className="text-secondary">
                              {notification.fromUserId}
                            </td>
                            <td className="text-secondary">
                              {notification.postId}
                            </td>
                            <td>
                              <span
                                className={`badge px-2 rounded-pill ${
                                  notification.readStatus
                                    ? "bg-success-soft text-success"
                                    : "bg-warning-soft text-warning"
                                }`}
                              >
                                {notification.readStatus ? "পড়া হয়েছে" : "অপঠিত"}
                              </span>
                            </td>
                            <td className="text-dark">
                              {translateNotificationMessage(notification.message)}
                            </td>
                            <td className="text-muted">
                              {formatTimestamp(notification.createdAt)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </form>
                <div ref={sentinelRef} style={{ height: 1 }} />
              </div>
            </div>
          </div>
        </div>
      </section>
      <Toaster position="top-right" />
      {showConfirm && (
        <div className="admin-modal-backdrop" role="presentation">
          <div
            className="admin-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="notification-delete-title"
            aria-describedby="notification-delete-description"
          >
            <div className="admin-modal-header">
              <h5 id="notification-delete-title" className="mb-0">
                বিজ্ঞপ্তি মুছুন
              </h5>
            </div>
            <div
              id="notification-delete-description"
              className="admin-modal-body"
            >
              <p className="mb-2">
                আপনি কি নিশ্চিতভাবে <strong>{selectedIds.size}</strong> টি বিজ্ঞপ্তি
                মুছতে চান?
              </p>
              <p className="text-muted mb-0">
                এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না এবং নির্বাচিত বিজ্ঞপ্তিগুলো
                স্থায়ীভাবে মুছে যাবে।
              </p>
            </div>
            <div className="admin-modal-footer">
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                onClick={cancelDelete}
              >
                বাতিল
              </button>
              <button
                type="button"
                className="btn btn-danger btn-sm"
                onClick={confirmDeleteSelected}
              >
                নিশ্চিত করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  </>
);
}
