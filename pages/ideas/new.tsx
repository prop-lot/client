import Router from "next/router";
import { useEffect, useState } from "react";
import { Row, Container, Col } from "react-bootstrap";
import Modal from "react-bootstrap/Modal";
import Nav from "react-bootstrap/Nav";
import { useAccount } from "wagmi";
import { useMutation, useLazyQuery, useQuery } from "@apollo/client";
import { marked } from "marked";
import DOMPurify from "dompurify";
import { SUBMIT_IDEA_MUTATION } from "@/graphql/queries/propLotMutations";
import { DELEGATED_VOTES_BY_OWNER_SUB } from "@/graphql/subgraph";
import { TagType } from "@/graphql/types/__generated__/apiTypes";
import { submitIdea } from "@/graphql/types/__generated__/submitIdea";
import { useApiError } from "@/hooks/useApiError";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import getCopyFor from "@/utils/copy";
import { GetServerSidePropsContext } from "next";
import prisma from "@/lib/prisma";
import { Community } from "@prisma/client";
import { SUPPORTED_SUBDOMAINS } from "@/utils/supportedTokenUtils";
import getCommunityByDomain from "@/utils/communityByDomain";
import { GET_TAGS } from "@/graphql/queries/tagsQuery";

enum FORM_VALIDATION {
  TITLE_MAX = 50,
  TITLE_MIN = 5,
  TLDR_MAX = 240,
  TLDR_MIN = 5,
  DESCRIPTION_MAX = 1080,
  DESCRIPTION_MIN = 5,
}

const MarkdownModalExample = ({
  showMarkdownModal,
  handleCloseMarkdownModal,
}: {
  showMarkdownModal: boolean;
  handleCloseMarkdownModal: () => void;
}) => (
  <Modal show={showMarkdownModal} onHide={handleCloseMarkdownModal} size="xl">
    <Modal.Header closeButton>
      <Modal.Title>Markdown Syntax</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <div className="grid grid-cols-3 gap-8">
        <div className="flex flex-col col-span-1">
          <div className="flex flex-row justify-between">
            <span># Header</span>
            <span>heading 1</span>
          </div>
          <div className="flex flex-row justify-between">
            <span>## Header</span>
            <span>heading 2</span>
          </div>
          <div className="flex flex-row justify-between">
            <span>### Header</span>
            <span>heading 3</span>
          </div>
        </div>
        <div className="flex flex-col col-span-1">
          <div className="flex flex-row justify-between">
            <span className="font-bold">*</span>
            <span>bullet point</span>
          </div>
          <div className="flex flex-row justify-between">
            <span>-</span>
            <span>bullet point</span>
          </div>
          <div className="flex flex-row justify-between">
            <span>1.</span>
            <span>list items</span>
          </div>
          <div className="flex flex-row justify-between">
            <span>Image</span>
            <span>![alt-text](image.jpg)</span>
          </div>
          <div className="flex flex-row justify-between">
            <span>Link</span>
            <span>[title](https://www.example.com)</span>
          </div>
        </div>
        <div className="flex flex-col col-span-1">
          <div className="flex flex-row justify-between">
            <span className="font-bold">**bold**</span>
            <span>bold text</span>
          </div>
          <div className="flex flex-row justify-between">
            <span className="italic">_italic_</span>
            <span>italic text</span>
          </div>
        </div>
      </div>
    </Modal.Body>
  </Modal>
);

const CreateIdeaPage = ({ community }: { community: Community }) => {
  const { address } = useAccount();
  const { setError, error: errorModalVisible } = useApiError();
  const { isLoggedIn, triggerSignIn } = useAuth();

  const { data: tagsResponse } = useQuery(
    GET_TAGS,
    {
      context: {
        clientName: "PropLot",
      },
    }
  );

  const [getDelegatedVotes, { data: getDelegatedVotesData }] = useLazyQuery(
    DELEGATED_VOTES_BY_OWNER_SUB,
    {
      context: {
        clientName: community?.uname as SUPPORTED_SUBDOMAINS,
      },
    }
  );

  useEffect(() => {
    if (address) {
      getDelegatedVotes({
        variables: {
          id: address.toLowerCase(),
        },
      });
    }
  }, [address, getDelegatedVotes]);

  const [submitIdeaMutation, { error, loading, data }] =
    useMutation<submitIdea>(SUBMIT_IDEA_MUTATION, {
      context: {
        clientName: "PropLot",
      },
    });

  useEffect(() => {
    if (error && !errorModalVisible) {
      setError({
        message: error?.message || "Failed to create idea",
        status: 500,
      });
    }
  }, [error, errorModalVisible, setError]);

  useEffect(() => {
    if (data?.submitIdea?.id) {
      Router.push(`/ideas/${data.submitIdea.id}`);
    }
  }, [data]);

  const [title, setTitle] = useState<string>("");
  const [tldr, setTldr] = useState<string>("");
  const [description, setDescription] = useState<string>("");

  const [showMarkdownModal, setShowMarkdownModal] = useState<boolean>(false);
  const handleCloseMarkdownModal = () => setShowMarkdownModal(false);
  const handleShowMarkdownModal = () => setShowMarkdownModal(true);

  const [descriptionTab, setDescriptionTab] = useState<"WRITE" | "PREVIEW">(
    "WRITE"
  );

  const titleValid =
    title.length <= FORM_VALIDATION.TITLE_MAX &&
    title.length >= FORM_VALIDATION.TITLE_MIN;
  const tldrValid =
    tldr.length <= FORM_VALIDATION.TLDR_MAX &&
    tldr.length >= FORM_VALIDATION.TLDR_MIN;
  const descriptionValid =
    description.length <= FORM_VALIDATION.DESCRIPTION_MAX &&
    description.length >= FORM_VALIDATION.DESCRIPTION_MIN;
  const formValid = titleValid && tldrValid && descriptionValid;

  const handleSelect = (e: any) => {
    setDescriptionTab(e);
  };

  const [selectedTags, setSelectedTags] = useState([] as string[]);

  const handleTagChange = (tagName: string) => {
    if (selectedTags.includes(tagName)) {
      setSelectedTags(selectedTags.filter((t) => t !== tagName));
    } else {
      setSelectedTags([...selectedTags, tagName]);
    }
  };

  // TODO: Load tags from API
  const tags = tagsResponse;

  return (
    <Container fluid={"lg"} className="mt-xl mb-xl">
      <Row className="align-items-center">
        <Col lg={10} className="mx-auto">
          <section>
            <MarkdownModalExample
              showMarkdownModal={showMarkdownModal}
              handleCloseMarkdownModal={handleCloseMarkdownModal}
            />
            <Row>
              <Link
                className="cursor-pointer text-slate flex flex-row items-center"
                href="/"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-[24px] h-[24px] mr-sm cursor-pointer"
                >
                  <path
                    fillRule="evenodd"
                    d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-4.28 9.22a.75.75 0 000 1.06l3 3a.75.75 0 101.06-1.06l-1.72-1.72h5.69a.75.75 0 000-1.5h-5.69l1.72-1.72a.75.75 0 00-1.06-1.06l-3 3z"
                    clipRule="evenodd"
                  />
                </svg>

                <span className="text-lg lodrina">Back</span>
              </Link>
              <h1 className="font-londrina text-black text-[56px]">Submit an Idea</h1>
            </Row>
            <p className="mb-sm">
              {`You must hold at least one ${getCopyFor(
                "nouns",
                "tokenName"
              )} in order to submit an idea and vote on others. There is no limit
              to the number of ideas you can submit and vote on.`}
            </p>
            <form
              id="submit-form"
              onSubmit={async (event) => {
                event.preventDefault();
                const target = event.target as HTMLFormElement; // quiets TS
                const tags = selectedTags as TagType[];

                if (!formValid || loading) {
                  return;
                }

                const getIdeaVariables = () => ({
                  variables: {
                    options: {
                      title,
                      tldr,
                      description,
                      tags,
                    },
                  },
                });

                if (!isLoggedIn) {
                  try {
                    const { success } = await triggerSignIn();
                    if (success) {
                      submitIdeaMutation(getIdeaVariables());
                    } else {
                      setError({ message: "Failed to sign in", status: 401 });
                    }
                  } catch (e) {
                    console.log(e);
                    setError({ message: "Failed to sign in", status: 401 });
                  }
                } else {
                  submitIdeaMutation(getIdeaVariables());
                }
              }}
            >
              <p className="font-londrina font-bold text-xl mb-sm">Tags</p>
              <span className="text-xs">
                Apply the tags that relate to your idea. Click to apply.
              </span>
              <div className="flex flex-row flex-wrap gap-md my-md">
                {tagsResponse?.tags?.map((tag: any) => {
                  console.log(tag.type)
                  return (
                    <div className="flex flex-col items-center" key={tag.label}>
                      <button
                        onClick={() => handleTagChange(tag.type)}
                        className={`cursor-pointer text-blue border text-xs font-bold rounded-[8px] px-sm py-xs flex ${
                          !selectedTags.includes(tag.type)
                            ? "border-black hover:bg-blue hover:text-white actve:bg-blue"
                            : "border-red-200 bg-blue text-white hover:bg-blue actve:bg-blue"
                        }`}
                      >
                        {tag.label}
                      </button>
                    </div>
                  );
                })}
              </div>
              <div className="flex flex-col my-md">
                <div className="flex justify-between w-full items-center">
                  <label className="font-londrina font-bold text-xl mb-sm">
                    Title
                  </label>
                  <span
                    className={`${
                      !titleValid ? "text-[#E40535]" : "text-dark-grey"
                    }`}
                  >
                    {title.length}/{FORM_VALIDATION.TITLE_MAX}
                  </span>
                </div>
                <input
                  maxLength={FORM_VALIDATION.TITLE_MAX}
                  minLength={FORM_VALIDATION.TITLE_MIN}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  type="text"
                  name="title"
                  className="border rounded-lg p-sm"
                  placeholder="Give your idea a name..."
                />
              </div>
              <div className="flex flex-col my-md">
                <div className="flex justify-between w-full items-center">
                  <label className="lodrina font-bold text-xl mb-sm">
                    tl;dr
                  </label>
                  <span
                    className={`${
                      !tldrValid ? "text-[#E40535]" : "text-dark-grey"
                    }`}
                  >
                    {tldr.length}/{FORM_VALIDATION.TLDR_MAX}
                  </span>
                </div>
                <textarea
                  maxLength={FORM_VALIDATION.TLDR_MAX}
                  minLength={FORM_VALIDATION.TLDR_MIN}
                  value={tldr}
                  onChange={(e) => setTldr(e.target.value)}
                  name="tldr"
                  className="border rounded-lg p-sm min-h-[120px]"
                  placeholder="In the simplest language possible, describe your idea in a few sentences..."
                />
              </div>
              <div className="flex flex-col my-md">
                <div className="flex justify-between w-full items-center">
                  <div className="space-x-sm">
                    <label className="lodrina font-bold text-xl mb-sm">
                      Description
                    </label>
                    <span
                      className="text-sm text-slate cursor-pointer"
                      onClick={handleShowMarkdownModal}
                    >
                      Markdown supported
                    </span>
                  </div>
                  <span
                    className={`${
                      !descriptionValid ? "text-[#E40535]" : "text-dark-grey"
                    }`}
                  >
                    {description.length}/{FORM_VALIDATION.DESCRIPTION_MAX}
                  </span>
                </div>
                <Nav
                  variant="tabs"
                  defaultActiveKey="WRITE"
                  className="mb-sm"
                  onSelect={handleSelect}
                >
                  <Nav.Item>
                    <Nav.Link eventKey="WRITE">Write</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="PREVIEW">Preview</Nav.Link>
                  </Nav.Item>
                </Nav>
                {descriptionTab === "WRITE" ? (
                  <textarea
                    maxLength={FORM_VALIDATION.DESCRIPTION_MAX}
                    minLength={FORM_VALIDATION.DESCRIPTION_MIN}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    name="description"
                    className="border rounded-lg p-sm min-h-[240px]"
                    placeholder="Describe your idea in full..."
                  />
                ) : (
                  <div
                    className="border rounded-lg p-sm min-h-[240px] prose-base"
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(marked.parse(description), {
                        ADD_ATTR: ["target"],
                      }),
                    }}
                  />
                )}
              </div>
              <div className="flex justify-end my-md">
                <button
                  type="submit"
                  className={`${
                    formValid
                      ? "!bg-[#2B83F6] !text-white"
                      : "!bg-[#F4F4F8] !text-[#E2E3E8]"
                  } !border-none !text-base flex-1 sm:flex-none !rounded-[10px] !font-inter !font-bold !pt-sm !pb-sm !pl-md !pr-md`}
                >
                  Submit
                </button>
              </div>
            </form>
          </section>
        </Col>
      </Row>
    </Container>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { communityDomain } = getCommunityByDomain(context.req);

  if (!communityDomain) {
    return {
      notFound: true,
    };
  }

  const community = await prisma.community.findFirst({
    where: {
      uname: communityDomain,
    },
  });

  if (!community) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      community: JSON.parse(JSON.stringify(community)),
    },
  };
}

export default CreateIdeaPage;
