import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

const AboutPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-6 text-center">About PRISM</h1>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-2xl">Our Vision</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg mb-4">
            PRISM envisions a future where the creation, distribution, and consumption of digital content is truly decentralized, equitable, and rewarding for all participants.
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Empower Creators with full ownership and fair compensation</li>
            <li>Foster Quality content through community curation</li>
            <li>Democratize Distribution, breaking down traditional barriers</li>
            <li>Incentivize Engagement from all participants</li>
            <li>Ensure Transparency using blockchain technology</li>
            <li>Drive Innovation in content creation and consumption</li>
            <li>Build a global, diverse Community of creators and consumers</li>
          </ul>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>What is PRISM?</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              PRISM is a revolutionary decentralized content ecosystem leveraging blockchain technology and NFTs. It creates a fair, transparent, and rewarding environment for content creators and consumers alike.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Key Features</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-6">
              <li>Create and mint Article NFTs</li>
              <li>Update article content (for owners)</li>
              <li>View article details and minting history</li>
              <li>Transfer ownership of Article NFTs</li>
              <li>Multi-level marketing structure for content sharing</li>
              <li>Revenue sharing between platform, creators, and curators</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
        </CardHeader>
        <CardContent>
          <h3 className="text-xl font-semibold mb-2">MLM Structure</h3>
          <p className="mb-4">
            PRISM implements a Multi-Level Marketing structure for content sharing and curation:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li><strong>Level 0:</strong> Original Creator</li>
            <li><strong>Level 1:</strong> Users who directly mint or share from the original creator</li>
            <li><strong>Level 2:</strong> Users who mint or share from Level 1 users</li>
            <li><strong>Level 3 and beyond:</strong> Continuing the chain with diminishing returns</li>
          </ul>
          <Separator className="my-4" />
          <h3 className="text-xl font-semibold mb-2">Revenue Model</h3>
          <p className="mb-2">Our revenue model benefits both the platform and its users:</p>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold">For Users:</h4>
              <ul className="list-disc pl-6">
                <li>Content Creators earn from initial sales and ongoing royalties</li>
                <li>Curators earn a percentage from shared content mints</li>
                <li>Readers can earn by identifying and sharing valuable content early</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold">For Platform:</h4>
              <ul className="list-disc pl-6">
                <li>Minting Fees from each new NFT</li>
                <li>Transaction Fees from sales or transfers</li>
                <li>Premium Features for additional services</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Join the Revolution</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg">
            Be part of the future of digital content. Whether you're a creator, curator, or reader, PRISM offers a unique opportunity to engage with and benefit from a truly decentralized content ecosystem.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AboutPage;