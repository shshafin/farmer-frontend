import React from "react";
import ModalShell from "@/components/ui/ModalShell";
import "@/assets/styles/ModelView.css";

export default function ModelView({ title, children, onClose }) {
  const hasChildren = React.Children.count(children) > 0;

  return (
    <ModalShell header={title} onClose={onClose} className="model-view">
      <section className="scrollView">
        {hasChildren ? children : <div className="empty-message">No comment yet</div>}
      </section>
    </ModalShell>
  );
}