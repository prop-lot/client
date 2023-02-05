import { Col, Row, Button, Spinner } from 'react-bootstrap';
import { v4 } from 'uuid';
import { Alert } from 'react-bootstrap';
// import { BigNumber as EthersBN } from 'ethers';
import { useParams } from 'react-router-dom';

// import Davatar from '@davatar/react';

import { useEffect, useState } from 'react';
import { useLazyQuery } from '@apollo/client';
import { GET_PROPLOT_PROFILE_QUERY } from '@/graphql/queries/propLotProfileQuery';
import ProfileTabFilters from '@/components/ProfileTabFilters';
import IdeaRow from '@/components/IdeaRow';
import {
  getPropLotProfile,
  getPropLotProfile_propLotProfile_profile_user_userStats as UserStats,
} from '@/graphql/types/__generated__/getPropLotProfile';
import UIFilter from '@/components/UIFilter';
import { useEnsName, useAccount } from "wagmi";
import { useShortAddress } from '@/utils/addressAndENSDisplayUtils';
// import useSyncURLParams from '@/utils/useSyncUrlParams';
// import { StandaloneNounCircular } from '../../components/StandaloneNoun';
// import { GrayCircle } from '../../components/GrayCircle';
import { TOKEN_BALANCES_BY_OWNER_SUB } from '@/graphql/subgraph';
import ProfileCommentRow from '@/components/ProfileCommentRow';
import { useRouter } from 'next/router';
// import ProfileGovernanceList from '@/components/ProfileGovernanceList';

// import useProfileGovernanceData, { TabFilterOptionValues } from '@/hooks/useProfileGovernanceData';

const ProfileCard = (props: { title: string; count: number; isLoading?: boolean }) => {
  return (
    <div className="font-propLot whitespace-nowrap py-[8px] px-[16px] gap-[4px] sm:p-[16px] sm:gap-[8px] bg-white border-solid border border-[#e2e3e8] rounded-[16px] box-border flex flex-1 flex-col justify-start">
      {props.isLoading ? (
        <div className="flex flex-1 justify-center mt-[18px]">
          <Spinner animation="border" />
        </div>
      ) : (
        <>
          <span className="font-semibold text-[12px] text-[#8C8D92]">{props.title}</span>
          <span className="font-extrabold text-[24px] text-[#212529]">{props.count}</span>
        </>
      )}
    </div>
  );
};

const ProfileLilNounDisplay = ({
  tokensInWallet,
  delegatedTokens
}: {
  tokensInWallet: number;
  delegatedTokens: number;
}) => {
  const { id } = useParams() as { id: string };

  return (
    <div className="flex flex-col justify-end gap-[16px]">
      {/* {Boolean(lilNounData?.length) ? (
        <div className="flex flex-1 flex-row-reverse gap-[4px] justify-center sm:justify-start">
          <>
            {lilNounData
              .map((lilNoun: any) => {
                return (
                  <StandaloneNounCircular
                    key={lilNoun.id}
                    nounId={EthersBN.from(lilNoun.id)}
                    styleOverride="!w-[48px] !h-[48px]"
                  />
                );
              })
              .slice(0, 5)}
            {lilNounData.length > 5 && (
              <GrayCircle
                styleOverride="!w-[48px] !h-[48px]"
                renderOverlay={() => {
                  return (
                    <span className="flex flex-1 mb-[-48px] text-[12px] h-full font-propLot font-semibold z-10 !text-[#212529] items-center justify-center">{`+${
                      lilNounData.length - 5
                    }`}</span>
                  );
                }}
              />
            )}
          </>
        </div>
      ) : (
        null // <Davatar size={32} address={id} provider={provider} />
      )} */}
      <div className="flex flex-1 text-[12px] text-[#8C8D92] font-semibold whitespace-pre justify-center">
        Tokens owned:<span className="text-[#212529]"> {tokensInWallet}</span>
        {` delegated:`}
        <span className="text-[#212529]">{` ${delegatedTokens - tokensInWallet}`}</span>
      </div>
    </div>
  );
};

const PropLotUserProfile = () => {
  const router = useRouter();
  const { id } = router.query as { id: string };
  const { address: account } = useAccount();
  // const {
  //   isLoading: isLoadingGovernance,
  //   snapshotProposalData,
  //   categorisedProposals,
  // } = useProfileGovernanceData();

  const [getPropLotProfileQuery, { data, refetch }] = useLazyQuery<getPropLotProfile>(
    GET_PROPLOT_PROFILE_QUERY,
    {
      context: {
        clientName: 'PropLot',
        headers: {
          'proplot-tz': Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
      },
    },
  );

  const [getTokenBalances, { data: tokenBalanceData }] = useLazyQuery(
    TOKEN_BALANCES_BY_OWNER_SUB,
    {
      context: {
        clientName: 'LilNouns', // change to 'NounsDAO' to query the nouns subgraph
      },
    },
  );

  /*
    Parse the query params from the url on page load and send them as filters in the initial
    PropLot query.
  */
  useEffect(() => {
    if (id) {
      const urlParams = window.location.search;
      const currentURLParams = urlParams
        .substring(1)
        .split('&')
        .filter(str => Boolean(str));

      getPropLotProfileQuery({
        variables: {
          options: {
            wallet: id,
            requestUUID: v4(),
            filters: currentURLParams,
          },
        },
      });

      getTokenBalances({
        variables: {
          id: id.toLowerCase(),
        },
      })
    }
  }, [id]);

  /*
    Filters that are applied to the current response.
    These can be parsed to update the local state after each request to ensure the client + API are in sync.
  */
  const appliedFilters = data?.propLotProfile?.metadata?.appliedFilters || [];
  // useSyncURLParams(appliedFilters);

  const handleUpdateFilters = (updatedFilters: string[], filterId: string) => {
    /*
      Keep previously applied filters, remove any that match the filterId value.
      Then add the selection of updatedFilters and remove the __typename property.
    */
    const selectedfilters: string[] = [
      ...appliedFilters.filter((f: string) => {
        return !f.includes(`${filterId}=`);
      }),
      ...updatedFilters,
    ];

    refetch({ options: { wallet: id, requestUUID: v4(), filters: selectedfilters } });
  };

  const { data: creatorEns } = useEnsName({
    address: id as `0x${string}`,
    cacheTime: 6_000,
  });

  const [listButtonActive, setListButtonActive] = useState('PROP_LOT');

  const lists: { [key: string]: any } = {
    PROP_LOT: {
      title: 'Prop Lot',
    },
    GOVERNANCE: {
      title: 'Governance',
    },
  };

  const delegatedTokens = tokenBalanceData?.tokenBalances?.delegate?.delegatedVotes || 0;
  const tokensInWallet = tokenBalanceData?.tokenBalances?.account?.tokenBalance || 0;

  const isAccountOwner = account !== undefined && account === id;

  const shortAddress = useShortAddress(id);
  const calculateOnchainVotes = () => {
    const yesVotes = categorisedProposals[TabFilterOptionValues.YES]?.length || 0;
    const noVotes = categorisedProposals[TabFilterOptionValues.NO]?.length || 0;
    const abstainedVotes = categorisedProposals[TabFilterOptionValues.ABSTAINED]?.length || 0;

    return yesVotes + noVotes + abstainedVotes;
  };

  const buildProfileCards = (userStats: UserStats) => {
    return (
      <>
        <ProfileCard count={userStats.totalIdeas || 0} title={'Prop Lot submissions'} />
        <ProfileCard count={userStats.upvotesReceived || 0} title={'Upvotes received'} />
        <ProfileCard count={userStats.downvotesReceived || 0} title={'Downvotes received'} />
        <ProfileCard count={userStats.netVotesReceived || 0} title={'Net votes'} />
        {/* <ProfileCard
          count={categorisedProposals[TabFilterOptionValues.SUBMITTED]?.length || 0}
          title={'On-chain proposals'}
          isLoading={isLoadingGovernance}
        />
        <ProfileCard
          count={calculateOnchainVotes()}
          title={'On-chain votes cast'}
          isLoading={isLoadingGovernance}
        /> */}
      </>
    );
  };

  return (
    <main className="pt-8">
      <section className="max-w-screen-xl mx-auto">
        <Col lg={10} className="ml-auto mr-auto">
          <Row>
            <div>
              <span className="text-[#8C8D92] flex flex-row items-center justify-center sm:justify-start">
                <span className="text-[24px] font-londrina">Profile</span>
              </span>
            </div>
            <div className="flex flex-col mb-[48px]">
              <div className="flex flex-col sm:flex-row justify-between items-center">
                <div className="flex flex-row justify-end">
                  <h1 className="font-londrina text-[48px] sm:text-[56px] text-[#212529] font-normal">
                    {creatorEns || shortAddress}
                  </h1>
                </div>
                <ProfileLilNounDisplay
                  delegatedTokens={delegatedTokens}
                  tokensInWallet={tokensInWallet}
                />
              </div>
            </div>
          </Row>
          <div className="font-propLot">
            <div className="grid gap-[16px] grid-cols-2 sm:!grid-cols-3 md:!grid-cols-4">
              {data?.propLotProfile?.profile.user.userStats &&
                buildProfileCards(data?.propLotProfile?.profile.user.userStats)}
            </div>

            {listButtonActive === 'GOVERNANCE' && (
              <>
                <div className="mt-[48px] sm:mt-[81px] flex flex-1 items-center flex-col-reverse gap-[16px] sm:gap-[8px] sm:flex-row">
                  <h2 className="font-londrina text-[38px] text-[#212529] font-normal flex flex-1">
                    Governance activity
                  </h2>
                  <div
                    className="flex flex-wrap justify-center !gap-[8px]"
                    role="btn-toolbar"
                    aria-label="Basic example"
                  >
                    {Object.keys(lists).map(list => {
                      return (
                        <Button
                          key={list}
                          className={`!border-box !flex !flex-row justify-center items-center !py-[8px] !px-[12px] !bg-white !border !rounded-[100px] ${
                            listButtonActive === list
                              ? '!text-[#212529] !border-[#2B83F6] !border-[2px]'
                              : '!text-[#8C8D92] !border-[#E2E3E8] !border-[1px]'
                          } !text-[16px] !font-semibold`}
                          id={list}
                          onClick={e => setListButtonActive(list)}
                        >
                          {lists[list].title}
                        </Button>
                      );
                    })}
                  </div>
                </div>
                {/* <ProfileGovernanceList
                  isLoadingGovernance={isLoadingGovernance}
                  snapshotProposalData={snapshotProposalData}
                  categorisedProposals={categorisedProposals}
                /> */}
              </>
            )}

            {listButtonActive === 'PROP_LOT' && (
              <>
                <div className="mt-[48px] sm:mt-[81px] flex flex-1 items-center flex-col-reverse gap-[16px] sm:gap-[8px] sm:flex-row">
                  <h2 className="font-londrina text-[38px] text-[#212529] font-normal flex flex-1">
                    Prop Lot activity
                  </h2>

                  <div
                    className="flex flex-wrap justify-center !gap-[8px]"
                    role="btn-toolbar"
                    aria-label="Basic example"
                  >
                    {Object.keys(lists).map(list => {
                      return (
                        <Button
                          key={list}
                          className={`!border-box !flex !flex-row justify-center items-center !py-[8px] !px-[12px] !bg-white !border !rounded-[100px] ${
                            listButtonActive === list
                              ? '!text-[#212529] !border-[#2B83F6] !border-[2px]'
                              : '!text-[#8C8D92] !border-[#E2E3E8] !border-[1px]'
                          } !text-[16px] !font-semibold`}
                          id={list}
                          onClick={e => setListButtonActive(list)}
                        >
                          {lists[list].title}
                        </Button>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-[32px] mb-[24px] flex flex-col-reverse sm:flex-row">
                  <div className="flex mb-[16px] sm:mt-0 mt-[16px] sm:mb-0">
                    {data?.propLotProfile?.tabFilter && (
                      <ProfileTabFilters
                        filter={data.propLotProfile.tabFilter}
                        updateFilters={handleUpdateFilters}
                      />
                    )}
                  </div>
                  <div className="flex flex-1 justify-end">
                    {data?.propLotProfile?.sortFilter && (
                      <UIFilter
                        filter={data.propLotProfile.sortFilter}
                        updateFilters={handleUpdateFilters}
                      />
                    )}
                  </div>
                </div>

                {data?.propLotProfile?.list?.map(listItem => {
                  if (listItem.__typename === 'Idea') {
                    return (
                      <div key={`idea-${listItem.id}`} className="mb-[16px] space-y-4" >
                        <IdeaRow
                          idea={listItem}
                          nounBalance={delegatedTokens}
                          disableControls={isAccountOwner}
                          refetch={() =>
                            refetch({
                              options: { wallet: id, requestUUID: v4(), filters: appliedFilters },
                            })
                          }
                        />
                      </div>
                    );
                  }

                  if (listItem.__typename === 'Comment') {
                    return (
                      <div key={`comment-${listItem.id}`} className="mb-[16px] space-y-4">
                        <ProfileCommentRow
                          comment={listItem}
                          refetch={() =>
                            refetch({
                              options: { wallet: id, requestUUID: v4(), filters: appliedFilters },
                            })
                          }
                        />
                      </div>
                    );
                  }

                  return null;
                })}
                {!Boolean(data?.propLotProfile?.list?.length) && (
                  <Alert variant="secondary">
                    <Alert.Heading>No data found.</Alert.Heading>
                    <p>We could not find any data for this user!</p>
                  </Alert>
                )}
              </>
            )}
          </div>
        </Col>
      </section>
    </main>
  );
};

export default PropLotUserProfile;
