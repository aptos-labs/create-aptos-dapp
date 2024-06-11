import { WalletSelector } from "@aptos-labs/wallet-adapter-ant-design";

import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Progress } from "../components/ui/progress";
import { config } from "../config";
import { Image } from "../components/ui/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
} from "../components/ui/accordion";
import { AccordionContent } from "@radix-ui/react-accordion";
import { Link } from "react-router-dom";

const IMG = (w: number = 300, h: number = 300) =>
  `https://picsum.photos/seed/picsum/${w}/${h}`;

const COLLECTION_ADDRESS = "0x8973..6855";
const COLLECTION_NAME = "Forest Friends";
const COLLECTION_DESCRIPTION = `Step into the enchanting world of "Forest Friends," a captivating NFT collection that celebrates the beauty of nature through charmingly crafted animal portraits. Each NFT in this collection showcases a unique forest inhabitant, rendered with exquisite detail and vibrant colors that breathe life into the digital canvas. From wise owls exuding a sense of serenity to playful foxes radiating boundless energy, every portrait captures the diverse range of emotions and personalities found in the heart of the wilderness.`;

export function Mint() {
  return (
    <div>
      {/* Nav Bar */}
      <nav className="navbar-container px-6 pt-6 flex justify-between">
        <p className="display">Forest Friends</p>
        <div>
          {import.meta.env.DEV && (
            <Link
              className="focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
              to={"/my-collections"}
            >
              My Collections
            </Link>
          )}
          <WalletSelector />
        </div>
      </nav>

      <main className="flex flex-col gap-10 md:gap-16 mt-6">
        {/* Hero */}
        <section className="hero-container flex flex-col md:flex-row gap-6 px-6">
          <Image src={IMG()} rounded className="basis-2/5" />
          <div className="basis-3/5 flex flex-col gap-4">
            <h1 className="title-md">{COLLECTION_NAME}</h1>
            {config.socials && (
              <ul className="flex gap-4">
                {config.socials.twitter && (
                  <li>
                    <Image />
                  </li>
                )}
                {config.socials.discord && (
                  <li>
                    <Image />
                  </li>
                )}
              </ul>
            )}
            <p className="body-sm">{COLLECTION_DESCRIPTION}</p>
            <Card>
              <CardContent
                fullPadding
                className="flex justify-between items-center"
              >
                <div className="flex gap-4">
                  <Input />
                  <Button>Mint</Button>
                </div>

                <div className="flex flex-col gap-2">
                  <p className="body-sm">436/500 Minted</p>
                  <Progress value={(436 / 500) * 100} className="h-2" />
                </div>
              </CardContent>
            </Card>
            <div className="flex">
              <p className="whitespace-nowrap">Collection Address</p>
              <div className="basis-full" />

              <p className="whitespace-nowrap">{COLLECTION_ADDRESS}</p>
              <a className="whitespace-nowrap" href="#">
                View on Explorer <Image />
              </a>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="stats-container px-6 ">
          <ul className="flex flex-col md:flex-row gap-6">
            {[
              { title: "Created NFTs", value: 500 },
              { title: "Total Minted", value: 436 },
              { title: "Unique Holders", value: 247 },
            ].map(({ title, value }) => (
              <li className="basis-1/3">
                <Card className="p-2" shadow="md">
                  <p className="label-sm">{title}</p>
                  <p className="heading-sm">{value}</p>
                </Card>
              </li>
            ))}
          </ul>
        </section>

        {/* Our Story */}
        {config.ourStory && (
          <section className="our-story-container px-6 flex flex-col md:flex-row gap-6">
            <div className="basis-3/5">
              <p className="label-sm">{config.ourStory.subTitle}</p>
              <p className="heading-md">{config.ourStory.title}</p>
              <p className="body-sm pt-2">{config.ourStory.description}</p>
              <Button className="mt-4" variant="outline">
                Join Our Discord
              </Button>
            </div>

            <Image src={IMG()} rounded className="basis-2/5" />
          </section>
        )}

        {/* How to mint */}
        <section className="how-to-mint-container px-6 text-center">
          <h2 className="heading-md">How to mint NFT</h2>

          <ol className="flex flex-col md:flex-row items-center md:justify-between pt-6 gap-6">
            {[
              "Connect Your Wallet",
              "Select quantity you want to mint",
              "Confirm transaction",
              "Receive your NFTs",
            ].map((text, index) => (
              <li key={index} className="flex items-center gap-4">
                <span className="title-md">{index + 1}</span>
                <p className="body-sm text-left">{text}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Banner */}
        <section className="banner-container">
          <Image />
        </section>

        {/* Our Team */}
        {config.ourTeam && (
          <section className="team-container px-6">
            <h2 className="text-center heading-md">{config.ourTeam.title}</h2>
            <ul className="flex justify-center gap-4 flex-wrap mt-4">
              {config.ourTeam?.members.map(({ img, name, role, socials }) => (
                <li key={name}>
                  <Card>
                    <CardHeader>
                      <Image src={img} rounded />
                    </CardHeader>
                    <CardContent>
                      <CardTitle className="flex justify-center">
                        {name}
                        {socials?.twitter && (
                          <a href={socials.twitter}>
                            <Image />
                          </a>
                        )}
                        {socials?.discord && (
                          <a href={socials.discord}>
                            <Image />
                          </a>
                        )}
                      </CardTitle>
                      <CardDescription>
                        <p className="text-center">{role}</p>
                      </CardDescription>
                    </CardContent>
                  </Card>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* FAQ */}
        {!!config.faqs && (
          <section className="faq-container px-6">
            <h2 className="text-center heading-md">{config.faqs.title}</h2>

            {config.faqs.questions.length > 0 && (
              <Accordion type="multiple">
                {config.faqs.questions.map(({ title, description }, i) => (
                  <AccordionItem value={`${i}-${title}`}>
                    <AccordionTrigger>
                      <p className="body-md-semibold">{title}</p>
                    </AccordionTrigger>
                    <AccordionContent>
                      <p className="body-sm py-4">{description}</p>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </section>
        )}

        {/* Footer */}
        <footer className="footer-container px-6 pb-6">
          <p>{COLLECTION_NAME}</p>

          {config.socials && (
            <div>
              {config.socials.twitter && <Image />}
              {config.socials.discord && <Image />}
            </div>
          )}
        </footer>
      </main>
    </div>
  );
}
