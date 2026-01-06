import styles from "../styles/Pesticide.module.css";
import ShieldIcon from "@/assets/IconComponents/ShieldIcon";
import { Link } from "react-router-dom";

/**
 * @param {{title:string, name:string, url:string}} props
 */
export default function PesticideCard({ title, name, url }) {
  return (
    <Link to={`/company/${url}`}>
      <article
        className={styles.card}
        role="button"
        tabIndex={0}>
        <div className={styles.cardHeader}>
          <div className={styles.avatar}>
            <ShieldIcon />
          </div>
          <div>
            <h3 className={styles.cardTitle}>{title}</h3>
            <p className={styles.cardSub}>{name}</p>
          </div>
        </div>
      </article>
    </Link>
  );
}
