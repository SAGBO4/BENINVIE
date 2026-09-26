"use client";

import { QrCode, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QrScanner } from "@/components/ui/qr-scanner";

/**
 * Un identifiant de donneur est un UUID. Le QR de la carte encode l'URL
 * complète: on accepte les deux et on extrait l'identifiant.
 */
const UUID_PATTERN =
  /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

function extractDonorId(input: string): string | null {
  return input.trim().match(UUID_PATTERN)?.[0] ?? null;
}

export function VerifyEntry() {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [scanOpen, setScanOpen] = useState(false);

  function open(input: string) {
    const id = extractDonorId(input);
    if (!id) {
      setError(
        "Cet identifiant n'a pas le format attendu. Scannez le QR code de la carte, ou copiez l'identifiant affiché dessous.",
      );
      return;
    }
    setError(null);
    router.push(`/verify/${id}`);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ouvrir une carte</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        <Button className="w-full" onClick={() => setScanOpen(true)}>
          <QrCode className="size-4" />
          Scanner le QR code
        </Button>

        <div className="text-muted-foreground flex items-center gap-3 text-xs">
          <span className="bg-border h-px flex-1" />
          ou
          <span className="bg-border h-px flex-1" />
        </div>

        <form
          className="space-y-2"
          onSubmit={(event) => {
            event.preventDefault();
            open(value);
          }}
        >
          <Label htmlFor="donor-id">Identifiant du donneur</Label>
          <div className="flex gap-2">
            <Input
              id="donor-id"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="00000000-0000-0000-0000-000000000000"
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? "donor-id-error" : undefined}
              className="font-mono"
            />
            <Button
              type="submit"
              variant="secondary"
              aria-label="Ouvrir la carte"
            >
              <Search className="size-4" />
            </Button>
          </div>
          {error ? (
            <p
              id="donor-id-error"
              role="alert"
              className="text-destructive text-xs"
            >
              {error}
            </p>
          ) : null}
        </form>
      </CardContent>

      <QrScanner
        open={scanOpen}
        onClose={() => setScanOpen(false)}
        onResult={open}
        title="Scanner une carte de donneur"
        description="Placez le QR code de la carte devant la caméra."
      />
    </Card>
  );
}
