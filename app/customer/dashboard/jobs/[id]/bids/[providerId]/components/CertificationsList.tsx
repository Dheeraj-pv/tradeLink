import Image from "next/image";
import type { Certification } from "../types";
import type { ServerMediaItem } from "@/components/ui/media-components";

interface Props {
  certifications: Certification[];
  onCertClick: (cert: Certification) => void;
}

export function CertificationsList({ certifications, onCertClick }: Props) {
  if (certifications.length === 0) return null;

  const certMediaItems: ServerMediaItem[] = certifications.map((cert) => ({
    id: cert.id,
    url: cert.url,
    mediaType: "IMAGE",
  }));

  return (
    <section>
      <h2>Certifications</h2>
      <div className="cert-grid">
        {certifications.map((cert, index) => (
          <div
            key={cert.id}
            className="cert-card"
            onClick={() => onCertClick(cert)}
          >
            <Image src="" alt="" width={100} height={100} />
            <p>{cert.title}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
