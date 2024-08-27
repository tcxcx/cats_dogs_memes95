/* eslint-disable no-unused-vars */
export {};

export declare type SearchParamProps = {
  params: { [key: string]: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

// ========================================

export declare type UserInfo = {
  email: string;
  name: string;
  picture: string;
};

// ========================================

export declare type Power = {
  type: "attack" | "defense" | "speed";
  value: number;
};

export declare type Type = {
  type: "Cat" | "Dog" | "Meme";
  value: number;
};

export declare type CardData = {
  id: number;
  name: string;
  type: Type[];
  subtype: string;
  powers: Power[];
  count: number;
  asset1?: string;
};

// ========================================
