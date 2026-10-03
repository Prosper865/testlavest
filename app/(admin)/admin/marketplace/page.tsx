import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/ui";
import { Card, Empty, PageHeader } from "@/features/admin";
import styles from "@/features/admin/components/admin.module.css";
import { listAllVehicles, VehicleCard, VehicleRowActions, vehicleName } from "@/features/marketplace";
import marketplaceStyles from "@/features/marketplace/components/marketplace.module.css";
import vehicleStyles from "@/features/marketplace/components/vehicle-admin.module.css";
import planStyles from "@/features/plans/components/plan-admin.module.css";
import { money } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Marketplace cars" };

export default async function AdminMarketplacePage({ searchParams }: PageProps<"/admin/marketplace">) {
  const [vehicles, params] = await Promise.all([listAllVehicles(), searchParams]);
  const visible = vehicles.filter(vehicle => vehicle.visible);

  return (
    <>
      <PageHeader
        title="Marketplace cars"
        description="The cars users can buy or save toward. Changes appear in the marketplace immediately."
        actions={<Link href="/admin/marketplace/new" className={planStyles.newButton}>+ Add car</Link>}
      />
      {params.saved && <p className={planStyles.saved} role="status">Car saved and published.</p>}

      <div className={styles.grid}>
        <Card title={`All cars (${vehicles.length})`} bodyless>
          {vehicles.length === 0 ? <Empty title="No cars yet">Add your first car to show it in the marketplace.</Empty> : (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead><tr><th>Car</th><th className={styles.hideSm}>Condition</th><th className={styles.hideSm}>Price</th><th><span className="visually-hidden">Actions</span></th></tr></thead>
                <tbody>
                  {vehicles.map((vehicle, index) => (
                    <tr key={vehicle.id}>
                      <td>
                        <div className={vehicleStyles.carCell}>
                          <span className={vehicleStyles.thumb} style={{ background: vehicle.swatch }}>
                            {/* eslint-disable-next-line @next/next/no-img-element -- admin photos can be on any https host */}
                            {vehicle.imageUrl && <img src={vehicle.imageUrl} alt="" />}
                          </span>
                          <div>
                            <b>{vehicleName(vehicle)}</b>
                            <div className={styles.muted}>{vehicle.visible ? "Shown in marketplace" : "Hidden"}{vehicle.imageUrl ? "" : " · no photo"}</div>
                          </div>
                        </div>
                      </td>
                      <td className={cn(styles.muted, styles.hideSm)}>{vehicle.condition}</td>
                      <td className={cn(styles.muted, styles.hideSm)}>{money(vehicle.price)}</td>
                      <td><VehicleRowActions id={vehicle.id} name={vehicleName(vehicle)} visible={vehicle.visible} isFirst={index === 0} isLast={index === vehicles.length - 1} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card title="Marketplace preview" action={<Link href="/marketplace" target="_blank">Open marketplace <Icon name="arrow-up-right" /></Link>}>
          {visible.length === 0 ? <Empty title="Nothing is shown">Turn on at least one car to show it in the marketplace.</Empty> : (
            <div className={marketplaceStyles.grid}>
              {visible.map(vehicle => <VehicleCard key={vehicle.id} vehicle={vehicle} />)}
            </div>
          )}
        </Card>
      </div>
    </>
  );
}
