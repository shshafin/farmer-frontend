import { useEffect, useState } from "react";
import axios from "axios";
import { translateNotificationMessage } from "@/utils/notificationText";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:5001/api/v1/notifications") // axios automatically sends auth token if setup
      .then((res) => setNotifications(res.data.notifications));
  }, []);

  return (
    <div>
      <h2>বিজ্ঞপ্তি</h2>
      {notifications.map((n) => (
        <div
          key={n._id}
          style={{ borderBottom: "1px solid #ccc", padding: "10px" }}>
          <b>{n.sender.username}</b> {translateNotificationMessage(n.message)}{" "}
          {n.post?.text && `"${n.post.text}"`}
          {!n.isRead && (
            <span style={{ color: "red", marginLeft: "10px" }}>●</span>
          )}
        </div>
      ))}
    </div>
  );
}
