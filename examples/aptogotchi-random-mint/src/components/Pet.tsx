"use client";
/* eslint-disable @next/next/no-img-element */

export interface Pet {
  parts: PetParts;
}

export interface PetParts {
  body: number;
  ear: number;
  face: number;
}

export const DEFAULT_PET = {
  name: "Unknown",
  parts: {
    body: 0,
    ear: 0,
    face: 0,
  },
};

export interface PetImageProps {
  petParts: PetParts;
}

export const BASE_PATH = "/pet-parts/";

export const bodies = [
  "body1.png",
  "body2.png",
  "body3.png",
  "body4.png",
  "body5.png",
];

export const ears = [
  "ear1.png",
  "ear2.png",
  "ear3.png",
  "ear4.png",
  "ear5.png",
  "ear6.png",
];

export const faces = ["face1.png", "face2.png", "face3.png", "face4.png"];

export function PetImage(props: PetImageProps) {
  const { petParts } = props;
  const head = BASE_PATH + "head.png";
  const body = BASE_PATH + bodies[petParts.body];
  const ear = BASE_PATH + ears[petParts.ear];
  const face = BASE_PATH + faces[petParts.face];

  const imgClass = "absolute top-0 left-0 w-full h-full object-contain";

  return (
    <div className="relative h-full w-full">
      <img src={head} className={imgClass} alt="pet head" />
      <img src={body} className={imgClass} alt="pet body" />
      <img src={ear} className={imgClass} alt="pet ears" />
      <img src={face} className={imgClass} alt="pet face" />
    </div>
  );
}

export function QuestionMarkImage() {
  return (
    <div className={`relative h-full w-full`}>
      <img
        src={BASE_PATH + "question_mark.png"}
        className={"absolute top-0 left-0 w-full h-full object-contain"}
        alt="pet mystery box"
      />
    </div>
  );
}
