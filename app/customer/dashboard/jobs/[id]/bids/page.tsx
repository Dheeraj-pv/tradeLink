"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { getUserFriendlyErrorMessage } from "@/lib/errors/error-message";

type Bid = {
  id: string;

  amount: number;

  message: string | null;

  status: string;

  provider: {
    id: string;
    name: string;

    avgRating: number;

    reviewCount: number;

    category: string;
  };
};

export default function BidsPage() {
  const router = useRouter();

  const params = useParams();

  const jobId = params.id as string;

  const [sort, setSort] = useState("Lowest Price");

  const [bids, setBids] = useState<Bid[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBids = async () => {
      try {
        setLoading(true);

        const res = await fetch(`/api/customer/jobs/${jobId}/bids`);

        const response = await res.json();

if (!res.ok) {
  toast.error(getUserFriendlyErrorMessage(response));
  return;
}

setBids(response.data.bids);
      } catch {
        toast.error("Network error");
      } finally {
        setLoading(false);
      }
    };

    fetchBids();
  }, [jobId]);

  const sortedBids = useMemo(() => {
    const copy = [...bids];

    if (sort === "Lowest Price") {
      copy.sort((a, b) => a.amount - b.amount);
    }

    if (sort === "Highest Price") {
      copy.sort((a, b) => b.amount - a.amount);
    }

    if (sort === "Highest Rating") {
      copy.sort((a, b) => b.provider.avgRating - a.provider.avgRating);
    }

    return copy;
  }, [bids, sort]);

  async function acceptBid(bidId: string) {
    const res = await fetch(
      `/api/customer/jobs/${jobId}/bids/${bidId}/accept`,

      {
        method: "POST",
      },
    );

    const data = await res.json();

    if (!res.ok) {
      toast.error(getUserFriendlyErrorMessage(data));

      return;
    }

    toast.success("Bid accepted");

    router.push("/customer/dashboard");
  }

  if (loading) {
    return <div className="dash-page">Loading bids...</div>;
  }

  return (
    <div className="dash-page">
      <Link href={`/customer/dashboard/jobs/${jobId}`} className="back-link">
        ← Back to Job Details
      </Link>

      <div className="header">
        <div>
          <h1>Bids Received</h1>

          <p>For: Fix leaking bathroom sink</p>
        </div>

        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option>Lowest Price</option>

          <option>Highest Price</option>

          <option>Highest Rating</option>
        </select>
      </div>

      <div className="bid-list">
        {sortedBids.map((bid) => (
          <div key={bid.id} className="bid-card">
            {bid.id === sortedBids[0]?.id && (
              <div className="lowest">✓ Lowest bid</div>
            )}

            <div className="top">
              <div className="avatar">
                {bid.provider.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)}
              </div>

              <div className="provider">
                <div className="name-row">
                  <h3>{bid.provider.name}</h3>

                  <span>{bid.provider.category}</span>
                </div>

                <p>
                  ★★★★★
                  {bid.provider.avgRating}({bid.provider.reviewCount}
                  reviews)
                </p>

                <p className="message">{bid.message}</p>
              </div>

              <div className="price">
                <h2>${bid.amount}</h2>

                <span>flat rate</span>
              </div>
            </div>

            <div className="actions">
              <button
                className="profile"
                onClick={() =>
                  router.push(
                    `/customer/dashboard/jobs/${jobId}/bids/${bid.provider.id}`,
                  )
                }
              >
                👁 Profile
              </button>

              <button className="accept" onClick={() => acceptBid(bid.id)}>
                ✓ Accept
              </button>
            </div>
          </div>
        ))}
      </div>

      <style>{`

    .header{

    display:flex;

    justify-content:space-between;

    align-items:center;

    margin-bottom:28px;

    }

    .header h1{

    font-size:2rem;

    margin-bottom:4px;

    }

    .header p{

    font-size:.9rem;

    color:var(--sub);

    }

    .header select{

    padding:10px 14px;

    border-radius:10px;

    border:1px solid var(--border);

    background:white;

    font-family:inherit;

    }

    .back-link{

    display:inline-flex;

    margin-bottom:18px;

    font-size:.85rem;

    color:var(--sub);

    text-decoration:none;

    }

    .bid-list{

    display:flex;

    flex-direction:column;

    gap:16px;

    }

    .bid-card{

    background:white;

    padding:20px;

    border-radius:14px;

    position:relative;

    }

    .lowest{

    display:inline-flex;

    padding:5px 12px;

    background:#e9f9ef;

    color:#159947;

    font-size:.75rem;

    font-weight:600;

    border-radius:999px;

    margin-bottom:18px;

    }

    .top{

    display:flex;

    gap:16px;

    align-items:flex-start;

    }

    .avatar{

    width:46px;

    height:46px;

    border-radius:50%;

    background:var(--navy);

    color:white;

    display:flex;

    align-items:center;

    justify-content:center;

    font-weight:700;

    flex-shrink:0;

    }

    .provider{

    flex:1;

    }

    .name-row{

    display:flex;

    align-items:center;

    gap:12px;

    margin-bottom:6px;

    }

    .name-row h3{

    font-size:1.15rem;

    }

    .name-row span{

    padding:4px 10px;

    background:#f3efe8;

    border-radius:999px;

    font-size:.75rem;

    color:var(--sub);

    }

    .provider p{

    font-size:.85rem;

    color:var(--sub);

    margin-bottom:10px;

    }

    .message{

    font-size:.92rem;

    line-height:1.7;

    }

    .price{

    text-align:right;

    min-width:100px;

    }

    .price h2{

    font-size:2rem;

    color:var(--navy);

    }

    .price span{

    font-size:.8rem;

    color:var(--sub);

    }

    .actions{

    display:flex;

    justify-content:flex-end;

    gap:10px;

    margin-top:18px;

    }

    .profile{

    padding:10px 18px;

    border:1px solid var(--border);

    border-radius:10px;

    background:white;

    font-weight:600;

    cursor:pointer;

    }

    .accept{

    padding:10px 20px;

    background:var(--navy);

    border:none;

    border-radius:10px;

    color:white;

    font-weight:600;

    cursor:pointer;

    }

    .accept:hover{

    background:#253460;

    }

    @media(max-width:900px){

    .top{

    flex-direction:column;

    }

    .price{

    text-align:left;

    }

    .actions{

    justify-content:flex-start;

    }

    }

    `}</style>
    </div>
  );
}
