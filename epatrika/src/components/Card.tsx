"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { InvitationData } from "@/types/invitation";
import { formatMapHref, formatWhatsAppHref } from "@/lib/utils";
import { useCardState } from "@/hooks/useCardState";
import { useCardGestures } from "@/hooks/useCardGestures";
import Page from "@/components/Page";
import PageIndicators from "@/components/PageIndicators";
import Motif from "@/components/Motif";

const PAGE_COUNT = 3;

export default function Card({ invitation }: { invitation: InvitationData }) {
  const { currentPage, activePage, progress, direction, setDrag, clearDrag, setPage } = useCardState();

  const commitTurn = (turnDirection: 1 | -1) => {
    const next = Math.min(Math.max(currentPage + turnDirection, 0), PAGE_COUNT - 1);
    setPage(next);
  };

  const gestures = useCardGestures({
    pageCount: PAGE_COUNT,
    currentPage,
    onPreviewTurn: ({ page, progress: p, direction: d }) => setDrag(page, p, d),
    onCommitTurn: commitTurn,
    onCancelTurn: clearDrag,
  });

  const rotations = useMemo(() => {
    return Array.from({ length: PAGE_COUNT }).map((_, index) => {
      if (activePage === index) {
        if (direction === 1) return -180 * progress;
        return -180 + 180 * progress;
      }
      return index < currentPage ? -180 : 0;
    });
  }, [activePage, currentPage, direction, progress]);

  return (
    <div className="card-stage">
      <motion.div
        className="card-shell"
        onPointerDown={(e) => gestures.handlePointerDown(e.clientX)}
        onPointerMove={(e) => gestures.handlePointerMove(e.clientX, e.currentTarget.clientWidth)}
        onPointerUp={(e) => gestures.handlePointerUp(e.clientX, e.currentTarget.clientWidth)}
        onPointerCancel={() => clearDrag()}
        onClick={(e) => {
          if ((e.target as HTMLElement).closest("a")) return;
          const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
          const isRight = e.clientX - rect.left > rect.width / 2;
          if (isRight) commitTurn(1);
          else commitTurn(-1);
        }}
      >
        <Page zIndex={3} rotation={rotations[0]}>
          <div className="page-content cover">
            <Motif />
            <p className="eyebrow">{invitation.eventLabel}</p>
            <h2 className="display-name">{invitation.familyName}</h2>
            <p className="tap-hint">Tap to open</p>
          </div>
        </Page>

        <Page zIndex={2} rotation={rotations[1]}>
          <div className="page-content center">
            <p className="eyebrow">{invitation.withFamiliesText}</p>
            <h3 className="name">{invitation.brideName}</h3>
            <span className="amp">&amp;</span>
            <h3 className="name">{invitation.groomName}</h3>
            <div className="divider" />
            <p className="body">{invitation.requestLine}</p>
            {invitation.secondEvent ? <p className="body subtle">{invitation.secondEvent}</p> : null}
          </div>
        </Page>

        <Page zIndex={1} rotation={rotations[2]}>
          <div className="page-content details">
            <p className="eyebrow">{invitation.dayName}</p>
            <h3 className="date">{invitation.dateText}</h3>
            <p className="body">{invitation.timeText}</p>
            <div className="divider" />
            <p className="venue">{invitation.venueName}</p>
            <p className="body subtle">{invitation.city}</p>
            {invitation.customNote ? <p className="body note">{invitation.customNote}</p> : null}
            <div className="action-row">
              <a
                href={formatWhatsAppHref(invitation.rsvpPhone, `We are delighted to attend ${invitation.brideName} & ${invitation.groomName}'s celebration.`)}
                target="_blank"
                rel="noreferrer"
              >
                RSVP
              </a>
              <a href={formatMapHref(invitation.mapQuery)} target="_blank" rel="noreferrer">
                Map
              </a>
            </div>
            <PageIndicators count={PAGE_COUNT} active={currentPage} />
          </div>
        </Page>
      </motion.div>
    </div>
  );
}
