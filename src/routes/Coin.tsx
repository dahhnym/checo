import {
  Outlet,
  useLocation,
  useParams,
  Link,
  useMatch,
} from 'react-router-dom';
import styled from 'styled-components';
import { useQuery } from 'react-query';
import { fetchCoinInfo, fetchCoinTickers } from '../api';
import { Helmet } from 'react-helmet-async';
import ControlBar from '../elements/ControlBar';

const Container = styled.div`
  padding: 0 20px;
  max-width: 480px;
  margin: 0 auto;
`;

const Header = styled.header`
  min-height: 10vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 1.5rem 0;
`;

const Title = styled.h1`
  font-size: 3rem;
  color: ${(props) => props.theme.textColor};
  font-weight: 700;
`;

const Loader = styled.div`
  text-align: center;
`;

export const OverviewBox = styled.dl`
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
  background-color: ${(props) => props.theme.boxBgColor};
  box-shadow: 0px 0px 5px 2px ${(props) => props.theme.boxShadow};
  color: ${(props) => props.theme.textColor};
  border-radius: 1rem;
  display: flex;
  padding: 1rem;
  text-align: center;

  dt {
    font-weight: 700;
    font-size: 0.8rem;
    margin-bottom: 0.5rem;
  }
`;

const Desc = styled.p`
  margin: 1rem 0;
  font-size: 1rem;
  padding: 0 0.5rem;
  line-height: 1.2rem;
`;

const TabContainer = styled.div`
  margin: 1.2rem 0;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
`;

const Tab = styled.span<{ isActive: boolean }>`
  padding: 0.5rem 1rem;
  text-align: center;
  border-radius: 1rem;
  background-color: ${(props) => props.theme.boxBgColor};
  box-shadow: 0px 0px 5px 2px ${(props) => props.theme.boxShadow};
  color: ${(props) => props.theme.textColor};
  font-weight: ${(props) => (props.isActive ? 'bold' : 'normal')};
  a {
    display: block;
  }
  &:hover {
    transition: all 0.2s ease-in-out;
    background-color: #b4bcdc;
    color: ${(props) => props.theme.bgColor};
  }
`;

interface RouteState {
  state: {
    name: string;
  };
}

interface InfoData {
  id: string;
  name: string;
  symbol: string;
  rank: number;
  is_new: boolean;
  is_active: boolean;
  type: string;
  description: string;
  message: string;
  open_source: boolean;
  started_at: string;
  development_status: string;
  hardware_wallet: boolean;
  proof_type: string;
  org_structure: string;
  hash_algorithm: string;
  first_data_at: string;
  last_data_at: string;
}

interface TickersData {
  id: string;
  name: string;
  symbol: string;
  rank: number;
  circulating_supply: number;
  total_supply: number;
  max_supply: number;
  beta_value: number;
  first_data_at: string;
  last_updated: string;
  quotes: {
    USD: {
      ath_date: string;
      ath_price: number;
      market_cap: number;
      market_cap_change_24h: number;
      percent_change_1h: number;
      percent_change_1y: number;
      percent_change_6h: number;
      percent_change_7d: number;
      percent_change_12h: number;
      percent_change_15m: number;
      percent_change_24h: number;
      percent_change_30d: number;
      percent_change_30m: number;
      percent_from_price_ath: number;
      price: number;
      volume_24h: number;
      volume_24h_change_24h: number;
    };
  };
}

interface ITheme {
  title: string;
}

const Coin = ({ title }: ITheme) => {
  const { coinId } = useParams();
  const { state } = useLocation() as RouteState;
  const priceMatch = useMatch(':coinId/price');
  const chartMatch = useMatch(':coinId/chart');
  const { isLoading: infoLoading, data: infoData } = useQuery<InfoData>(
    ['info', coinId],
    () => fetchCoinInfo(coinId!),
  );
  const { isLoading: tickersLoading, data: tickersData } =
    useQuery<TickersData>(['ticker', coinId], () => fetchCoinTickers(coinId!), {
      refetchInterval: 5000,
    });

  const loading = infoLoading || tickersLoading;

  return (
    <Container>
      <Helmet>
        <title>
          {state?.name
            ? `${title} | ${state.name}`
            : loading
            ? 'Loading...'
            : infoData?.name}
        </title>
      </Helmet>
      <Header>
        <ControlBar />
        <Title>{state?.name || 'Loading...'}</Title>
      </Header>
      {loading ? (
        <Loader>Loading...</Loader>
      ) : (
        <>
          <OverviewBox>
            <div>
              <dt>RANK</dt>
              <dd>{infoData?.rank}</dd>
            </div>
            <div>
              <dt>SYMBOL</dt>
              <dd>{infoData?.symbol}</dd>
            </div>
            <div>
              <dt>PRICE</dt>
              <dd>{tickersData?.quotes.USD.price.toFixed(3)}</dd>
            </div>
          </OverviewBox>
          <Desc>{infoData?.description}</Desc>
          <OverviewBox>
            <div>
              <dt>TOTAL SUPPLY</dt>
              <dd>{tickersData?.total_supply}</dd>
            </div>
            <div>
              <dt>MAX SUPPLY</dt>
              <dd>{tickersData?.max_supply}</dd>
            </div>
          </OverviewBox>
        </>
      )}
      <TabContainer>
        <Tab isActive={priceMatch !== null}>
          <Link to={`price`} state={state}>
            Price
          </Link>
        </Tab>
        <Tab isActive={chartMatch !== null}>
          <Link to={`chart`} state={state}>
            Chart
          </Link>
        </Tab>
      </TabContainer>
      <Outlet context={tickersData?.quotes.USD} />
    </Container>
  );
};

export default Coin;
