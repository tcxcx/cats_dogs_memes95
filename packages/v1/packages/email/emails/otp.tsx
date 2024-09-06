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
// import { Logo } from "components/logo";

const baseUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3001";

interface OtpEmailTemplateProps {
  firstName: string;
  otpCode: string;
}

export default function OtpEmailTemplate({
  firstName,
  otpCode,
}: OtpEmailTemplateProps) {
  return (
    <Html>
      <Preview>Hello, {firstName}!</Preview>
      <Tailwind>
        <Body className="my-auto mx-auto font-sans">
          <Container className="border-transparent my-[40px] mx-auto max-w-[600px]">
            {/* <Logo baseUrl={baseUrl} /> */}
            <Heading className="font-normal text-center p-0 my-[30px] mx-0">
              Welcome to Cats, Dogs, Memes, Etc.
            </Heading>
            <Section className="mb-4">
              Are you a Cat, a Dog, a Meme or an Etcetera?
            </Section>
            <Section className="mb-4">Your One-Time Password (OTP) is:</Section>
            <Section className="mb-4 text-xl font-bold">
              <strong>{otpCode}</strong>
            </Section>
            <Section className="mb-8">
              Please use this code to complete your authentication process.
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
