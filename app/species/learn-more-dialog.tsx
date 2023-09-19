"use client";

import { Icons } from "@/components/icons"; // COME BACK TO THIS
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { type Database } from "@/lib/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { useState, type BaseSyntheticEvent } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

type Species = Database["public"]["Tables"]["species"]["Row"];

// We use zod (z) to define a schema for the "Add species" form.
// zod handles validation of the input values with methods like .string(), .nullable(). It also processes the form inputs with .transform() before the inputs are sent to the database.

const kingdoms = z.enum(["Animalia", "Plantae", "Fungi", "Protista", "Archaea", "Bacteria"]);

const speciesSchema = z.object({
  common_name: z
    .string()
    .nullable()
    // Transform empty string or only whitespace input to null before form submission
    .transform((val) => (val?.trim() === "" ? null : val?.trim())),
  description: z
    .string()
    .nullable()
    .transform((val) => (val?.trim() === "" ? null : val?.trim())),
  kingdom: kingdoms,
  scientific_name: z
    .string()
    .trim()
    .min(1)
    .transform((val) => val?.trim()),
  total_population: z.number().int().positive().min(1).optional(),
  image: z
    .string()
    .url()
    .nullable()
    .transform((val) => val?.trim()),
});

type FormData = z.infer<typeof speciesSchema>;

const defaultValues: Partial<FormData> = {
  kingdom: "Animalia",
};

export default function LearnMoreDialog({species}: {species: Species}) {
  const router = useRouter();
  const [open, setOpen] = useState<boolean>(false);

  // Indicates if a species is endangered (<2500 left) or if total population is unknown
  // species.total_population may be null, cannot treat it as a number
  let total_pop = "";
  let total_pop_endger = "";
  if(!species.total_population) {
    total_pop = 'Unknown';
  }else if(species.total_population < 2500) {
    total_pop = `Only ${species.total_population.toLocaleString('en-us', {minimumFractionDigits: 0})} left!`;
    total_pop_endger = `The ${species.common_name} is ENDANGERED!`;
  }else {
    total_pop = `${species.total_population.toLocaleString('en-us', {minimumFractionDigits: 0})}`;
  }

  const form = useForm<FormData>({
    resolver: zodResolver(speciesSchema),
    defaultValues,
    mode: "onChange",
  });

  const onSubmit = async (input: FormData) => {
    // The `input` prop contains data that has already been processed by zod. We can now use it in a supabase query
    const supabase = createClientComponentClient<Database>();
    // Reset form values to the data values that have been processed by zod.
    // This way the user sees any changes that have occurred during transformation
    form.reset(input);

    setOpen(false);

    // Refresh all server components in the current route. This helps display the newly created species because species are fetched in a server component, species/page.tsx.
    // Refreshing that server component will display the new species from Supabase
    router.refresh();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="mt-3 w-full" variant="default" onClick={() => setOpen(true)}>
          <strong>Learn More</strong>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-screen overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>More Information</DialogTitle>
          <DialogDescription>
            View detailed information about {species.common_name}s here.
            <br></br>Click &quot;Close&quot; below when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <DialogTitle>
          Scientific Name
        </DialogTitle>
        <DialogDescription>
          <strong><i>{species.scientific_name}</i></strong> - (otherwise known as The {species.common_name})
        </DialogDescription>

        <DialogTitle>
          Total Population
        </DialogTitle>
        <DialogDescription>
          <strong>{total_pop}</strong><br></br>
          {total_pop_endger}
        </DialogDescription>

        <DialogTitle>
          Kingdom
        </DialogTitle>
        <DialogDescription>
          <strong>{species.kingdom}</strong>
        </DialogDescription>

        <DialogTitle>
          Description
        </DialogTitle>
        <DialogDescription>
          {species.description}
        </DialogDescription>

        <div className="flex">
                <Button
                  type="button"
                  className="ml-1 mr-1 flex-auto"
                  variant="secondary"
                  onClick={() => setOpen(false)}
                >
                  Close
                </Button>
              </div>

      </DialogContent>
    </Dialog>
  );
}
