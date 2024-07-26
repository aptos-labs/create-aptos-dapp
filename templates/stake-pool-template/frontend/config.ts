import Twitter from "@/assets/icons/twitter.svg";

export const config: Config = {
  // TODO: Fill in your collection id
  collection_id: "",

  // Removing one or all of these socials will remove them from the page
  socials: {
    twitter: "https://twitter.com",
    discord: "https://discord.com",
    homepage: "#",
  },

  defaultCollection: {
    name: "Lorem Ipsum",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris congue convallis augue in pharetra.",
  },

  ourStory: {
    subTitle: "About Us",
    title: "Staking TOKEN",
    description:
      "Phasellus pellentesque malesuada pretium. Vestibulum sed justo at velit rhoncus finibus nec quis urna. Aenean rutrum congue tincidunt. Praesent id urna quis risus sodales feugiat vitae quis orci. Proin tincidunt eu nisi quis sollicitudin. Nulla facilisis eget tellus quis fermentum. Nunc vel neque at erat dictum tempus. Aliquam in mollis lacus, non fringilla lacus. Nunc blandit iaculis ante vitae pulvinar.",
    discordLink: "https://discord.com",
  },

  benefits: [
    {
      icon: Twitter,
      title: "It's easy",
      description: "Enroll with just a couple of clicks. You can earn rewards on TOKEN",
    },
    {
      icon: Twitter,
      title: "It's secure",
      description:
        "Staking TOKEN is safe and secure due to its robust underlying blockchain technology, comprehensive security protocols.",
    },
    {
      icon: Twitter,
      title: "It's passive income",
      description:
        "Staking TOKEN offers a safe and secure way to earn passive income through its reliable blockchain technology",
    },
  ],

  faqs: {
    title: "F.A.Q.",

    questions: [
      {
        title: "Id Quis Mollit Est",
        description:
          "Exercitation tempor id ex aute duis laboris dolore est elit fugiat consequat exercitation ullamco. Labore sint laborum anim sunt labore commodo proident adipisicing minim eu duis velit. Est ipsum nisi labore ullamco velit laborum qui in. Fugiat cillum tempor proident occaecat do ipsum Lorem eu labore duis do ex anim. Ullamco incididunt irure officia ex reprehenderit. Voluptate tempor reprehenderit elit exercitation consequat labore ipsum duis reprehenderit. Ex qui aliqua ex aute sunt.",
      },
      {
        title: "Magna Nostrud Eu Nostrud Occaecat",
        description:
          "Et aute duis culpa anim sint pariatur ipsum et irure aliquip eu velit. Aliquip Lorem nostrud adipisicing deserunt sit ut aliqua enim amet velit fugiat cillum quis ut. Tempor consequat adipisicing laborum ut ipsum ut elit ad amet qui Lorem ea commodo culpa. Commodo adipisicing sit sint aute deserunt. Proident enim proident labore. Aliquip minim aliqua proident mollit fugiat ipsum qui duis deserunt ea duis. Deserunt anim incididunt irure commodo sint adipisicing magna dolor excepteur.",
      },
      {
        title: "In Amet Mollit Tempor Dolor Consequat Commodo",
        description:
          "Fugiat fugiat dolor id aute labore esse incididunt. Reprehenderit nostrud ad elit enim occaecat. Sunt non ex veniam officia dolore deserunt consequat. Excepteur voluptate cillum fugiat reprehenderit consequat eu eu amet dolor enim tempor.",
      },
    ],
  },
};

export interface Config {
  collection_id: string;

  socials?: {
    twitter?: string;
    discord?: string;
    homepage?: string;
  };

  defaultCollection?: {
    name: string;
    description: string;
  };

  benefits: {
    icon: string;
    title: string;
    description: string;
  }[];

  ourStory?: {
    title: string;
    subTitle: string;
    description: string;
    discordLink: string;
  };

  faqs?: {
    title: string;
    questions: Array<{
      title: string;
      description: string;
    }>;
  };
}

export interface ConfigTeamMember {
  name: string;
  role: string;
  socials?: {
    twitter?: string;
    discord?: string;
  };
}
