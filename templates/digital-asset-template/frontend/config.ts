interface Config {
  socials?: {
    twitter?: string;
    discord?: string;
  };

  aboutUs?: {
    title: string;
    description: string;
  };

  ourTeam?: {
    title: string;
    members: Array<{
      name: string;
      role: string;
      img: string;
      socials?: {
        twitter?: string;
        discord?: string;
      };
    }>;
  };

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

export const config: Config = {
  socials: {
    twitter: "https://twitter.com",
    discord: "https://discord.com",
  },

  aboutUs: {
    title: "Our Story",
    description: `"Forest Friends" began as a heartfelt project inspired by the serene beauty and diverse life found in the world's forests. Created by a passionate artist with a deep love for nature, this NFT collection brings together a series of meticulously designed animal portraits, each reflecting a unique emotion and vibrant personality. The collection aims to capture the essence of the wild and remind us of the importance of preserving our natural habitats. Through "Forest Friends," collectors are invited to embark on a journey into a whimsical forest, where every animal tells a story of wonder, joy, and the delicate balance of nature.`,
  },

  ourTeam: {
    title: "Our Team",
    members: [
      {
        name: "Mepoti",
        role: "Founder & CEO",
        img: "https://picsum.photos/seed/picsum/200/200",
      },
      {
        name: "Zucker",
        role: "Director of Content",
        img: "https://picsum.photos/seed/picsum/200/200",
      },
      {
        name: "SimonT",
        role: "Lead Developer",
        img: "https://picsum.photos/seed/picsum/200/200",
      },
    ],
  },

  ourStory: {
    title: "Our Story",
    subTitle: "About Us",
    description: `"Forest Friends" began as a heartfelt project inspired by the serene beauty and diverse life found in the world's forests. Created by a passionate artist with a deep love for nature, this NFT collection brings together a series of meticulously designed animal portraits, each reflecting a unique emotion and vibrant personality. The collection aims to capture the essence of the wild and remind us of the importance of preserving our natural habitats. Through "Forest Friends," collectors are invited to embark on a journey into a whimsical forest, where every animal tells a story of wonder, joy, and the delicate balance of nature.`,
    discordLink: "https://discord.com",
  },

  faqs: {
    title: "F.A.Q.",

    questions: [
      {
        title: "Who are Forest Friends?",
        description:
          "Exercitation tempor id ex aute duis laboris dolore est elit fugiat consequat exercitation ullamco. Labore sint laborum anim sunt labore commodo proident adipisicing minim eu duis velit. Est ipsum nisi labore ullamco velit laborum qui in. Fugiat cillum tempor proident occaecat do ipsum Lorem eu labore duis do ex anim. Ullamco incididunt irure officia ex reprehenderit. Voluptate tempor reprehenderit elit exercitation consequat labore ipsum duis reprehenderit. Ex qui aliqua ex aute sunt.",
      },
      {
        title: "Why we are so cool?",
        description:
          "Exercitation tempor id ex aute duis laboris dolore est elit fugiat consequat exercitation ullamco. Labore sint laborum anim sunt labore commodo proident adipisicing minim eu duis velit. Est ipsum nisi labore ullamco velit laborum qui in. Fugiat cillum tempor proident occaecat do ipsum Lorem eu labore duis do ex anim. Ullamco incididunt irure officia ex reprehenderit. Voluptate tempor reprehenderit elit exercitation consequat labore ipsum duis reprehenderit. Ex qui aliqua ex aute sunt.",
      },
      {
        title: "What can you do with NFTs?",
        description:
          "Exercitation tempor id ex aute duis laboris dolore est elit fugiat consequat exercitation ullamco. Labore sint laborum anim sunt labore commodo proident adipisicing minim eu duis velit. Est ipsum nisi labore ullamco velit laborum qui in. Fugiat cillum tempor proident occaecat do ipsum Lorem eu labore duis do ex anim. Ullamco incididunt irure officia ex reprehenderit. Voluptate tempor reprehenderit elit exercitation consequat labore ipsum duis reprehenderit. Ex qui aliqua ex aute sunt.",
      },
    ],
  },
};
