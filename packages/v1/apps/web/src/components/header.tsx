"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@v1/ui/dialog";
import Image from "next/image";
import Link from "next/link";
import { SubscribeForm } from "./subscribe-form";

export function Header() {
  return (
    <header className="absolute top-0 w-full flex items-center justify-between p-4 z-10">
      <span className="hidden md:block text-sm font-medium">
        memestic memes
      </span>

      <Link href="/">
        <div className="flex flex-col-2 justify-between">
          <div className="justify-end">
            <div className="flex">🐱</div>
            <div className="flex">🐸</div>
            <div className="flex">🐶</div>
            <div className="flex">🤖</div>
          </div>
          <div className="justify-start font-departure uppercase">
            <div className="flex">Cats</div>
            <div className="flex">Dogs</div>
            <div className="flex">Memes</div>
            <div className="flex">etc</div>
          </div>
        </div>
      </Link>

      <nav className="md:mt-2">
        <ul className="flex gap-4">
          <li>
            <a
              href="https://www.demo.cats-dogs-memes-etc.wtf/"
              className="text-sm px-4 py-2 bg-primary text-secondary rounded-full font-medium"
            >
              App
            </a>
          </li>
          <li>
            <Dialog>
              <DialogTrigger
                className="text-sm px-4 py-2 bg-secondary text-primary rounded-full font-medium cursor-pointer"
                asChild
              >
                <span>Get updates</span>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Stay updated</DialogTitle>
                  <DialogDescription>
                    Subscribe to our newsletter to get the latest news and
                    updates on release.
                  </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-4">
                  <SubscribeForm
                    group="cdme-newsletter"
                    placeholder="Email address"
                  />
                </div>
              </DialogContent>
            </Dialog>
          </li>
        </ul>
      </nav>
    </header>
  );
}
