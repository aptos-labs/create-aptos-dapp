import { WalletSelector } from "@aptos-labs/wallet-adapter-ant-design";
import "@aptos-labs/wallet-adapter-ant-design/dist/index.css";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Progress } from "./components/ui/progress";
import { config } from "./config";

const IMG = (w: number = 300, h: number = 300) =>
  `https://picsum.photos/seed/picsum/${w}/${h}`;

const COLLECTION_ADDRESS = "0x8973..6855";
const COLLECTION_NAME = "Forest Friends";
const COLLECTION_DESCRIPTION = `Step into the enchanting world of "Forest Friends," a captivating NFT collection that celebrates the beauty of nature through charmingly crafted animal portraits. Each NFT in this collection showcases a unique forest inhabitant, rendered with exquisite detail and vibrant colors that breathe life into the digital canvas. From wise owls exuding a sense of serenity to playful foxes radiating boundless energy, every portrait captures the diverse range of emotions and personalities found in the heart of the wilderness.`;

function App() {
  return (
    <main className="flex flex-col gap-6">
      {/* Nav Bar */}
      <nav className="navbar-container px-6 flex justify-between">
        <p className="navbar-text">Forest Friends</p>
        <div>
          <WalletSelector />
        </div>
      </nav>

      {/* Hero */}
      <section className="hero-container flex gap-6 px-6">
        <img src={IMG()} />
        <div>
          <h1 className="title-100">{COLLECTION_NAME}</h1>
          {config.socials && (
            <ul className="flex gap-4">
              {config.socials.twitter && (
                <li>
                  <img />
                </li>
              )}
              {config.socials.discord && (
                <li>
                  <img />
                </li>
              )}
            </ul>
          )}
          <p className="component-100">{COLLECTION_DESCRIPTION}</p>
          <div className="flex justify-between items-center">
            <div className="flex gap-4">
              <Input />
              <Button>Mint</Button>
            </div>

            <div className="flex flex-col gap-4">
              <p>436/500 Minted</p>
              <Progress value={(436 / 500) * 100} />
            </div>
          </div>
          <div className="flex">
            <p className="whitespace-nowrap">Collection Address</p>
            <div className="basis-full" />

            <p className="whitespace-nowrap">{COLLECTION_ADDRESS}</p>
            <a className="whitespace-nowrap" href="#">
              View on Explorer <img />
            </a>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="stats-container px-6 ">
        <ul className="flex gap-6 justify-stretch">
          {[
            { title: "Created NFTs", value: 500 },
            { title: "Total Minted", value: 436 },
            { title: "Unique Holders", value: 247 },
          ].map(({ title, value }) => (
            <li>
              <p>{title}</p>
              <p>{value}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* Our Story */}
      {config.ourStory && (
        <section className="our-story-container px-6 flex gap-6">
          <div>
            <p>{config.ourStory.subTitle}</p>
            <p className="heading-100">{config.ourStory.title}</p>
            <p>{config.ourStory.description}</p>
            <Button>Join Our Discord</Button>
          </div>

          <img src={IMG()} />
        </section>
      )}

      {/* How to mint */}
      <section className="how-to-mint-container px-6 text-center">
        <h2 className="heading-100">How to mint NFT</h2>

        <ol className="flex justify-between">
          {[
            "Connect Your Wallet",
            "Select quantity you want to mint",
            "Confirm transaction",
            "Receive your NFTs",
          ].map((text, index) => (
            <li key={index} className="flex content-center">
              <span className="">{index + 1}</span>
              <p>{text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Banner */}
      <section className="banner-container">
        <img />
      </section>

      {/* Our Team */}
      {config.ourTeam && (
        <section className="team-container px-6">
          <h2 className="text-center heading-100">{config.ourTeam.title}</h2>
          <ul className="flex justify-center gap-4">
            {config.ourTeam?.members.map(({ img, name, role, socials }) => (
              <li key={name}>
                <img src={img} />
                <div className="flex justify-center">
                  {name}
                  {socials?.twitter && (
                    <a href={socials.twitter}>
                      <img />
                    </a>
                  )}
                  {socials?.discord && (
                    <a href={socials.discord}>
                      <img />
                    </a>
                  )}
                </div>
                <p className="text-center">{role}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* FAQ */}
      {!!config.faqs && (
        <section className="faq-container px-6">
          <h2 className="text-center heading-100">{config.faqs.title}</h2>

          {config.faqs.questions.length > 0 && (
            <ul>
              {config.faqs.questions.map(({ title, description }, i) => (
                <li key={i + title}>
                  <p>{title}</p>
                  <p>{description}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {/* Footer */}
      <footer className="footer-container px-6">
        <p>{COLLECTION_NAME}</p>

        {config.socials && (
          <div>
            {config.socials.twitter && <img />}
            {config.socials.discord && <img />}
          </div>
        )}
      </footer>
    </main>
  );
}

export default App;
