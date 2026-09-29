import Image from "next/image";
import type { ReactNode } from "react";
import { money } from "@/lib/format";
import type { Vehicle } from "../vehicles";
import styles from "./marketplace.module.css";

export function VehicleCard({ vehicle, children }: { vehicle: Vehicle; children?: ReactNode }) {
  return (
    <article className={styles.card}>
      <div className={styles.art}>
        <span>{vehicle.condition.toUpperCase()} · {vehicle.year}</span>
        <Image src="/logos/tesla.svg" alt="" width={22} height={22} />
        <i className={styles.paint} style={{ background: vehicle.swatch }} aria-hidden="true" />
        <b>{vehicle.model}</b>
      </div>
      <div className={styles.body}>
        <h3>{vehicle.trim}</h3>
        <p>{vehicle.color} · {vehicle.highlight}</p>
        <div className={styles.price}>{money(vehicle.price)}</div>
        <div className={styles.specs}>
          <div>{vehicle.rangeMiles} mi<small>Est. range</small></div>
          <div>{vehicle.zeroToSixty}s<small>0–60 mph</small></div>
          <div>{vehicle.mileage ? `${(vehicle.mileage / 1000).toFixed(1)}k` : "New"}<small>Odometer</small></div>
        </div>
        <div className={styles.actions}>{children}</div>
      </div>
    </article>
  );
}
