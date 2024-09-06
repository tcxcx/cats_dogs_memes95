import {
  Body,
  Button,
  Container,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Tailwind,
} from "@react-email/components";
import { Logo } from "components/logo";

const baseUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3001";

export default function WelcomeEmail() {
  return (
    <Html>
      <Preview>Welcome</Preview>
      <Tailwind>
        <Body className="my-auto mx-auto font-sans">
          <Container className="border-transparent my-[40px] mx-auto max-w-[600px]">
            <Logo baseUrl={baseUrl} />
            <Heading className="font-normal text-center p-0 my-[30px] mx-0">
              Welcome to Cats, Dogs, Memes, Etc.
            </Heading>
            <Section className="mb-4">
              Are you a Cat, a Dog, a Meme or an Etcetera?
            </Section>
            <Section className="mb-4">
              Lorem ipsum dolor sit amet, memestic memes consectetur adipiscing elit. Nullam
              euismod, nisi vel memlord interdum, nisl nunc egestas meme,
              vitae et Vitalik tincidunt nisl nunc meme-ified nunc. Sed euismod, nisi vel
              dank meme interdum, nisl nunc egestas meme, vitae tincidunt nisl
              nunc meme-lord nunc. Sed memestic, nisi vel meme-tastic interdum,
              nisl nunc egestas meme, vitae tincidunt nisl nunc meme-ified nunc.
            </Section>
            <Section className="mb-4">
              Lorem ipsum dolor sit amet, memestic consectetur adipiscing elit. Sed do
              eiusmod tempor incididunt ut labore et meme magna aliqua. Ut
              enim ad minim veniam, quis nostrud memlord exercitation ullamco laboris
              nisi ut aliquip ex ea commodo meme-tastic consequat.
            </Section>
            <Section className="mb-8">
              Lorem ipsum dolor sit amet, cats and dogs consectetur adipiscing elit. Sed do
              eiusmod tempor incididunt ut labore et meme magna aliqua. Ut
              enim ad minim veniam, quis nostrud exercitation ullamco laboris
              nisi ut aliquip ex ea commodo dank consequat. Etcetera, etcetera.
            </Section>
            <Section className="mb-6">
              <Link href={baseUrl}>
                <Button className="bg-black text-white p-4 text-center">
                  Get started
                </Button>
              </Link>
            </Section>
            <Hr />
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
