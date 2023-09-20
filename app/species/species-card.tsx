import { Button } from "@/components/ui/button";
import type { Database } from "@/lib/schema";
import Image from "next/image";
import LearnMoreDialog from "./learn-more-dialog";
import EditSpeciesDialog from "./edit-species-dialog";
import { Session } from "@supabase/auth-helpers-nextjs";
type Species = Database["public"]["Tables"]["species"]["Row"];

export default function SpeciesCard(species: Species , userId: string) {
  return (
    <div className="min-w-72 m-4 w-72 flex-none rounded border-2 p-3 shadow">
      {species.image && (
        <div className="relative h-40 w-full">
          <Image src={species.image} alt={species.scientific_name} fill style={{ objectFit: "cover" }} />
        </div>
      )}
      <h3 className="mt-3 text-2xl font-semibold">{species.common_name}</h3>
      <h4 className="text-lg font-light italic">{species.scientific_name}</h4>
      <p>{species.description ? species.description.slice(0, 150).trim() + "..." : ""}</p>
      {/* Replace with detailed view */}
      <div>
        <LearnMoreDialog key={new Date().getTime()} species={species}/>
      </div>
      <EditSpeciesDialog key={new Date().getTime()} species={species}/>
    </div>
  );
}
