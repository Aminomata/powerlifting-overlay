export type Locale = "en" | "fr";

export const LOCALES: Locale[] = ["en", "fr"];

export const DEFAULT_LOCALE: Locale = "en";

export function isLocale(value: string | undefined | null): value is Locale {
  return value === "en" || value === "fr";
}

export type TranslationParams = Record<string, string | number>;

/** English dictionary shape — French must implement the same keys. */
export type Messages = {
  "lang.en": string;
  "lang.fr": string;
  "lang.label": string;

  "brand.title": string;
  "brand.subtitle": string;
  "toolbar.data": string;
  "action.sampleJson": string;
  "action.importJson": string;
  "action.exportJson": string;
  "action.addAthlete": string;

  "tabs.control": string;
  "tabs.preview": string;

  "competition.title": string;
  "competition.name": string;
  "competition.currentLift": string;
  "competition.platforms": string;
  "competition.flights": string;
  "competition.activePlatform": string;
  "competition.activeFlight": string;
  "competition.format": string;
  "competition.copyObsUrl": string;
  "competition.urlCopied": string;
  "competition.lanHint": string;

  "live.title": string;
  "live.hideOverlay": string;
  "live.showOverlay": string;
  "live.activeAthlete": string;
  "live.none": string;
  "live.selectAthlete": string;
  "live.barWeight": string;
  "live.currentStatus": string;
  "live.previousAttempt": string;
  "live.nextAttempt": string;
  "live.previousAthlete": string;
  "live.nextAthlete": string;

  "athletes.title": string;
  "athletes.filter": string;
  "athletes.sortByWeight": string;
  "athletes.empty": string;
  "athletes.col.lot": string;
  "athletes.col.athlete": string;
  "athletes.col.class": string;
  "athletes.col.a1": string;
  "athletes.col.a2": string;
  "athletes.col.a3": string;
  "athletes.col.total": string;
  "athletes.col.actions": string;
  "athletes.live": string;
  "athletes.moveUp": string;
  "athletes.moveDown": string;
  "athletes.putOnScreen": string;
  "athletes.edit": string;
  "athletes.delete": string;

  "athleteModal.addTitle": string;
  "athleteModal.editTitle": string;
  "athleteModal.description": string;
  "athleteModal.firstName": string;
  "athleteModal.lastName": string;
  "athleteModal.club": string;
  "athleteModal.weightClass": string;
  "athleteModal.platform": string;
  "athleteModal.flight": string;
  "athleteModal.cancel": string;
  "athleteModal.save": string;
  "athleteModal.saving": string;
  "athleteModal.attempt": string;
  "athleteModal.attemptStatus": string;

  "deleteAthlete.title": string;
  "deleteAthlete.body": string;
  "deleteAthlete.thisAthlete": string;
  "deleteAthlete.cancel": string;
  "deleteAthlete.confirm": string;

  "admin.loading": string;
  "admin.loadError": string;
  "admin.retry": string;

  "overlayPreview.title": string;
  "overlayPreview.description": string;

  "overlay.competitionFallback": string;
  "overlay.noAthlete": string;
  "overlay.total": string;

  "lift.squat": string;
  "lift.bench": string;
  "lift.deadlift": string;
  "liftShort.squat": string;
  "liftShort.bench": string;
  "liftShort.deadlift": string;

  "format.sbd": string;
  "format.benchOnly": string;

  "status.pending": string;
  "status.goodLift": string;
  "status.noLift": string;

  "platform": string;
  "flight": string;
};
