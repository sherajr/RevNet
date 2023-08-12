import { ConnectWallet, useStorage, Web3Button, useAddress, MediaRenderer } from "@thirdweb-dev/react";
import "./styles/Home.css";
import { EAS, Offchain, SchemaEncoder, SchemaRegistry } from "@ethereum-attestation-service/eas-sdk";
import { ethers } from 'ethers';
import React, { useState, useEffect } from 'react';

export const EASContractAddress = "0xAcfE09Fd03f7812F022FBf636700AdEA18Fd2A7A"; // Changed to Base Goerli to test on existing schemas


// Initialize the sdk with the address of the EAS Schema contract address
const eas = new EAS(EASContractAddress);

// Gets a default provider (in production use something else like infura/alchemy)
const provider = ethers.providers.getDefaultProvider(
  "https://goerli.base.org"
);

// Connects an ethers style provider/signingProvider to perform read/write functions.
// MUST be a signer to do write operations!
eas.connect(provider);

const schemaRegistryContractAddress = "0x720c2bA66D19A725143FBf5fDC5b4ADA2742682E"; // Base-Goerli
const schemaRegistry = new SchemaRegistry(schemaRegistryContractAddress);
schemaRegistry.connect(provider);

const schemaUID = "0xa2fef44eb7eef2a4d04d3811bd15bc66d8bcdfd8bf23d438f8c667e64a2f97e5";

const uid = "0xf0fe492510b3f4a290008d88ac549a23ec8051fc74d5138e5197b22f9914ff05";

function decodeABIString(data) {
  const abiCoder = new ethers.utils.AbiCoder();
  const decodedData = abiCoder.decode(
      ["string", "string", "string", "string"],
      data
  );

  return decodedData;
}

function decodeReviewData(data) {
  const abiCoder = new ethers.utils.AbiCoder();
  const decodedData = abiCoder.decode(
      ["bool", "uint8", "string"],
      data
  );

  return decodedData;
}

function decodeReplyData(data) {
  const abiCoder = new ethers.utils.AbiCoder();
  const decodedData = abiCoder.decode(
      ["bool", "string"],
      data
  );

  return decodedData;
}


export default function Home() {

  const address = useAddress();

  async function fetchGraphQLData(endpoint, query) 
  {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: query,
        variables: {},
      }),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    
    console.log('response', response);
    console.log('data', data);
    return data;
}


  async function handleFormSubmit(e) {
    e.preventDefault();

    if (window.ethereum) {
      const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = web3Provider.getSigner();
      eas.connect(signer);  // Connecting with the signer
    } else {
      console.error("Please install a web3 provider like Metamask");
    }

    // Encode the data
    const schemaEncoder = new SchemaEncoder("string username, string profilePicture, string twitterUsername, string aboutMe");
    const encodedData = schemaEncoder.encodeData([
        { name: "username", value: username, type: "string" },
        { name: "profilePicture", value: pfp, type: "string" },
        { name: "twitterUsername", value: twitterHandle, type: "string" },
        { name: "aboutMe", value: aboutMe, type: "string" },
    ]);

    // Create the attestation
    const tx = await eas.attest({
        schema: schemaUID,
        data: {
            recipient: address,
            expirationTime: 0,
            revocable: false,
            data: encodedData,
        },
    });
}

async function handleReviewSubmit() {
  if (window.ethereum) {
    const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = web3Provider.getSigner();
    eas.connect(signer);  // Connecting with the signer
  } else {
    console.error("Please install a web3 provider like Metamask");
  }
  // Here, you'll use the review state (review.trueProfile, review.rating, review.reviewText) to create the review attestation.
  const schemaEncoder = new SchemaEncoder("bool trueProfile,uint8 rating,string review");
  const encodedData = schemaEncoder.encodeData([
      { name: "trueProfile", value: review.trueProfile, type: "bool" },
      { name: "rating", value: review.rating, type: "uint8" },
      { name: "review", value: review.reviewText, type: "string" },
  ]);

  const schemaUID = "0x4ba4f9ba4c0ce9eacbe7298dbc8d2434588d95b75e52de343dd7ac99046e6107";

  const tx = await eas.attest({
    schema: schemaUID,
    data: {
      recipient: userBeingReviewedAddress,
      expirationTime: 0,
      revocable: true,
      refUID: userBeingReviewedId,
      data: encodedData,
    },
  });
  
  // After attestation, you might want to close the modal
  setIsReviewModalOpen(false);
  // And clear the review data
  setReview({
      trueProfile: false,
      rating: 0,
      reviewText: ''
  });
}

async function handleReplySubmit(reviewAttestationId) {
  if (window.ethereum) {
      const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = web3Provider.getSigner();
      eas.connect(signer);  // Connecting with the signer
  } else {
      console.error("Please install a web3 provider like Metamask");
  }
  
  const replySchemaUID = "0x275d3c62f5dd03970225e637b074f4e2ca03429bf3fcef3fcd0b4274171053e7";
  // Encode the reply data
  const schemaEncoder = new SchemaEncoder("bool like, string reply");
  const encodedData = schemaEncoder.encodeData([
      { name: "like", value: reply.like, type: "bool" },
      { name: "reply", value: reply.replyText, type: "string" },
  ]);

  // Submit the attestation, linking the reply to the review via refUID
  const tx = await eas.attest({
      schema: replySchemaUID,
      data: {
          recipient: address,
          expirationTime: 0,
          revocable: true,
          refUID: reviewAttestationId, // Using the review attestation ID passed to the function
          data: encodedData,
      },
  });

  // After attestation, you might want to close the reply modal (if you have one) 
  // and clear the reply data
  setReply({
      like: false,
      replyText: ''
  });
}



  const storage = useStorage();

  const [attestationData, setAttestationData] = useState(null);
  // const [schemaData, setSchemaData] = useState(null);
  const [attestations, setAttestations] = useState([]);
  const [reviews, setReviews]=useState([]);
  const [profile, setProfile] = useState(null);
  const [username, setUsername] = useState('');
  const [twitterHandle, setTwitterHandle] = useState('');
  const [aboutMe, setAboutMe] = useState('');
  const [pfp, setPfp] = useState(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [userBeingReviewedAddress, setUserBeingReviewedAddress] = useState(null);
  const [review, setReview] = useState({
      trueProfile: false,
      rating: 0,
      reviewText: ''
  });
  const [userBeingReviewedId, setUserBeingReviewedId] = useState(null);
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
  const [reply, setReply] = useState({
      like: false,
      replyText: ''
  });
  const [reviewBeingRepliedTo, setReviewBeingRepliedTo] = useState(null);
  const [replies, setReplies] = useState([]);


  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (address) {
        const hasExistingProfile = attestations.some(attestation => attestation.recipient.toLowerCase() === address.toLowerCase());
        setProfile(hasExistingProfile);
    }
}, [address, attestations]);

useEffect(() => {
  const endpoint = "https://base-goerli.easscan.org/graphql";
  const query = `
  query Attestations {
    attestations(orderBy: {schemaId: desc}) {
      schemaId
      id
      recipient
      data
      refUID
    }
  }
  `;

  fetchGraphQLData(endpoint, query)
        .then(data => {
            if (data.data && data.data.attestations) {
                const userSchemaUID = "0xa2fef44eb7eef2a4d04d3811bd15bc66d8bcdfd8bf23d438f8c667e64a2f97e5";
                const reviewSchemaUID = "0x4ba4f9ba4c0ce9eacbe7298dbc8d2434588d95b75e52de343dd7ac99046e6107";

                const filteredAttestations = data.data.attestations.filter(attestation => attestation.schemaId === userSchemaUID);
                setAttestations(filteredAttestations);
                console.log('filteredAttestations', filteredAttestations);

                const filteredReviews = data.data.attestations.filter(attestation => 
                    attestation.schemaId === reviewSchemaUID && 
                    filteredAttestations.some(userAttest => userAttest.id === attestation.refUID)
                );
                setReviews(filteredReviews);
                console.log('filteredReviews', filteredReviews);

                const replySchemaUID = "0x275d3c62f5dd03970225e637b074f4e2ca03429bf3fcef3fcd0b4274171053e7";
                const filteredReplies = data.data.attestations.filter(attestation => 
                    attestation.schemaId === replySchemaUID && 
                    filteredReviews.some(review => review.id === attestation.refUID)
                );
                setReplies(filteredReplies);
                console.log('filteredReplies', filteredReplies);

            }
        })
        .catch(error => {
            console.error("Error fetching attestations:", error);
        });      
}, []);

useEffect(() => {
  console.log("All Reviews:", reviews);
}, [reviews]);

useEffect(() => {
  console.log("All Replies:", replies);
}, [replies]);



  // useEffect(() => {
  //   const fetchAttestation = async () => {
  //       const attestation = await eas.getAttestation(uid);
  //       const schemaRecord = await schemaRegistry.getSchema({ uid: schemaUID });
  //       setAttestationData(attestation);
  //       setSchemaData(schemaRecord);
  //       console.log('attestation', attestation);
  //       console.log('schema', schemaRecord);
  //   };
  
  //   fetchAttestation();
  // }, []); // Empty dependency array means this effect will run once when the component mounts.

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const fileUri = await storage?.upload(file);
      setPfp(fileUri);
      console.log('fileUri',fileUri)
      
      // Now you have the URI of the uploaded image. Store it in the state or wherever you need it.
    }
  }


  
  

  return (
    <main className="main">
      <div className="container">
        <div className="header">
          <h1 className="title">
            Welcome to{" "}
            <span className="gradient-text-0">

                RevNet.
              
            </span>
          </h1>

          <p className="description">
            Get started by connecting your wallet, create your RevNet ID, then Review other members of your Community!
          </p>

          <div className="connect">
            <ConnectWallet
              dropdownPosition={{
                side: "bottom",
                align: "center",
              }}
            />
          </div>
        </div>

        {!profile && (
              <div className="createProfile" style={{ textAlign: 'center', padding: '2rem' }}>
                  <h1 className="gradient-text-1" style={{ textAlign: 'center', marginBottom: '1rem' }}>Create Your Profile</h1>
                  <form onSubmit={handleFormSubmit}>
                      
                      <div className="description" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                          <label className="gradient-text-2" htmlFor="username" style={{ flex: 1, textAlign: 'left', fontSize: '0.95rem' }}>Username:</label>
                          <input type="text" id="username" name="username" required value={username} onChange={(e) => setUsername(e.target.value)} />
                      </div>

                      <div className="description" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                          <label className="gradient-text-2" htmlFor="twitterHandle" style={{ flex: 1, textAlign: 'left', fontSize: '0.95rem' }}>Twitter Handle:</label>
                          <input type="text" id="twitterHandle" name="twitterHandle" required value={twitterHandle} onChange={(e) => setTwitterHandle(e.target.value)} />
                      </div>

                      <div className="description" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1rem' }}>
                          <label className="gradient-text-2" style={{ flex: 1, textAlign: 'left', fontSize: '0.9rem' }} >About Me:</label>
                          <textarea id="aboutMe" name="aboutMe" rows="8" required value={aboutMe} onChange={(e) => setAboutMe(e.target.value)}></textarea>
                      </div>

                      <div className="description" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                          <label className="gradient-text-2" style={{ flex: 1, textAlign: 'left', fontSize: '0.9rem' }}>Profile Picture:</label>
                          <input type="file" onChange={handleImageUpload} required style={{ flex: 2 }} />
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'center', margin: '1rem 0' }}>
                          <MediaRenderer src={pfp} className="card" />
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
                          <button className="gradient-text-3" type="submit">Create Profile</button>
                      </div>
                  </form>
              </div>
          )}


        {/* <div className="code">
        <h2>Schema Data</h2>
        <pre>{JSON.stringify(schemaData, null, 3)}</pre>
        <h2>Attestation Data</h2>
        <pre>{JSON.stringify(attestationData, null, 1)}</pre>
        </div> */}
        <div className="user-grid">
          {attestations.map(attestation => {
              const [username, profilePicture, twitterUsername, aboutMe] = decodeABIString(attestation.data);
              const userReviews = reviews.filter(review => review.refUID === attestation.id);

            

              // Calculate the number of reviews that state the profile is true
              const trueReviewsCount = userReviews.reduce((count, reviewAttestation) => {
                  const [trueProfile, ] = decodeReviewData(reviewAttestation.data);
                  return trueProfile ? count + 1 : count;
              }, 0);

              // Calculate the "Profile Authenticity" percentage
              const authenticityPercentage = ((trueReviewsCount / userReviews.length) * 100).toFixed(0); // Rounded to the nearest whole number

              // Calculate the average rating
              const totalRating = userReviews.reduce((sum, reviewAttestation) => {
                  const [, rating, ] = decodeReviewData(reviewAttestation.data);
                  return sum + rating;
              }, 0);
              const averageRating = (totalRating / userReviews.length).toFixed(1);

              return (
                  <div key={attestation.id} className="user-card">
                      <p className="gradient-text-1">{username}</p>
                      <p className="small-font">User Address: {attestation.recipient}</p>
                      <MediaRenderer src={profilePicture} className="card" />
                      <p>Twitter: {twitterUsername}</p>
                      <p className="small-font">{aboutMe}</p>
                      <p>Profile Authenticity: {authenticityPercentage}%</p>
                      <p>Average Rating: {averageRating}⭐</p>
                      <button onClick={() => {
                          setUserBeingReviewedAddress(attestation.recipient);
                          setUserBeingReviewedId(attestation.id)
                          setIsReviewModalOpen(true);
                      }}>
                          Review
                      </button>
                      
                      {/* Render Reviews for this user */}
                      {userReviews.map(reviewAttestation => { // Here's where reviewAttestation is defined
                        const [trueProfile, , reviewText] = decodeReviewData(reviewAttestation.data);
                        
                        // Filter replies specifically for the current review
                        const repliesForCurrentReview = replies.filter(replyAttestation => 
                            reviewAttestation.id === replyAttestation.refUID
                        );
                        console.log(`Replies for user ${attestation.recipient}`, repliesForCurrentReview);

                        return (
                          <div key={reviewAttestation.id} className="review-card">
                          <p><strong>Reviewer:</strong> {reviewAttestation.recipient}</p>
                          <p><strong>Review:</strong> {reviewText}</p>
                          <button onClick={() => {
                              setReviewBeingRepliedTo(reviewAttestation.id);  // store the ID of the review being replied to
                              setIsReplyModalOpen(true);  // open the reply modal
                          }}>
                              Reply
                          </button>
                                <div className="replies">
                                    {repliesForCurrentReview.map(replyAttestation => { // Using repliesForCurrentReview
                                        const [like, replyText] = decodeReplyData(replyAttestation.data);
                                        return (
                                            <div key={replyAttestation.id} className="reply">
                                                <p>{replyText}</p>
                                                {like && <span>👍</span>}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                  </div>
              );
          })}
      </div>

        {isReviewModalOpen && (
          <div className="modal open" onClick={() => setIsReviewModalOpen(false)}>
              <div className="modal-content" onClick={e => e.stopPropagation()}>
                <p className="gradient-text-1">Review for {userBeingReviewedAddress}</p>
                
                <label>
                    <input type="checkbox" checked={review.trueProfile} onChange={(e) => setReview(prev => ({ ...prev, trueProfile: e.target.checked }))} />
                    This is a true profile to the best of my knowledge.
                </label>
<p></p>
                <label>
                    Rating:
                    {[1, 2, 3, 4, 5].map(star => (
                        <span key={star} onClick={() => setReview(prev => ({ ...prev, rating: star }))}>
                            {star <= review.rating ? '★' : '☆'}
                        </span>
                    ))}
                </label>

                <textarea value={review.reviewText} onChange={(e) => setReview(prev => ({ ...prev, reviewText: e.target.value }))} placeholder="Your review..."></textarea>

                <button onClick={handleReviewSubmit}>Submit Review</button>
                <button onClick={() => setIsReviewModalOpen(false)}>Close</button>
        </div>
    </div>
)}

{isReplyModalOpen && (
    <div className="modal open" onClick={() => setIsReplyModalOpen(false)}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
            <p>Reply to Review</p>
            
            <label>
                <input type="checkbox" checked={reply.like} onChange={(e) => setReply(prev => ({ ...prev, like: e.target.checked }))} />
                Like this review
            </label>

            <textarea value={reply.replyText} onChange={(e) => setReply(prev => ({ ...prev, replyText: e.target.value }))} placeholder="Your reply..."></textarea>

            <button onClick={() => handleReplySubmit(reviewBeingRepliedTo)}>Submit Reply</button>
            <button onClick={() => setIsReplyModalOpen(false)}>Close</button>
        </div>
    </div>
)}



        <div className="grid">
          <a
            href="https://docs.attest.sh/docs/welcome"
            className="card"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src="/images/EAS_Logo.jpg"
              alt="EAS Docs"
            />
            <div className="card-text">
              <h2 className="gradient-text-1">Ethereum Attestation Service ➜</h2>
              <p>
                EAS Docs for easy reference.
              </p>
            </div>
          </a>

          <a
            href="https://base.org/"
            className="card"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src="/images/Base_Blog_header.png"
              alt="Base Network Image"
            />
            <div className="card-text">
              <h2 className="gradient-text-2">Base ➜</h2>
              <p>
                Check out Base and their latest developments.
              </p>
            </div>
          </a>

          <a
            href="https://thirdweb.com/templates"
            className="card"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src="/images/templates-preview.png"
              alt="Placeholder preview of templates"
            />
            <div className="card-text">
              <h2 className="gradient-text-3">Thirdweb Templates ➜</h2>
              <p>
                Discover and clone template projects showcasing thirdweb
                features.
              </p>
            </div>
          </a>
        </div>
      </div>
    </main>
  );
}
