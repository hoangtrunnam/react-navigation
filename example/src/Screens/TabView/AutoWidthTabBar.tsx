import { useLocale } from '@react-navigation/native';
import * as React from 'react';
import { Dimensions, StyleSheet, type TextProps } from 'react-native';
import {
  type NavigationState,
  SceneMap,
  type SceneRendererProps,
  TabBar,
  TabBarItem,
  type TabBarItemProps,
  TabView,
} from 'react-native-tab-view';

import { Albums } from '../../Shared/Albums';
import { Article } from '../../Shared/Article';
import { Chat } from '../../Shared/Chat';
import { Contacts } from '../../Shared/Contacts';
import { TabBarIndicator } from './components/TabBarIndicator';

type Route = {
  key: string;
  title: string;
};

interface CustomTabBarItemProps extends TabBarItemProps<Route> {
  labelProps?: TextProps;
}

const customTabInficator = (
  props: SceneRendererProps & { navigationState: NavigationState<Route> }
) => {
  return <TabBarIndicator {...props} />;
};

const CustomTabBarItem = (props: CustomTabBarItemProps) => {
  return <TabBarItem {...props} />;
};
const renderScene = SceneMap({
  albums: () => <Albums />,
  contacts: () => <Contacts />,
  article: () => <Article />,
  chat: () => <Chat bottom />,
  long: () => <Article />,
  medium: () => <Article />,
});

export const AutoWidthTabBar = () => {
  const { direction } = useLocale();
  const [index, setIndex] = React.useState(0);
  const windowWidth = Dimensions.get('window').width;
  const [routes] = React.useState([
    { key: 'article', title: 'Article' },
    { key: 'contacts', title: 'Contacts haha' },
    {
      key: 'albums',
      title: 'Albums123121 312312 long long long and more long long ',
    },
    { key: 'chat', title: 'Chat' },
    { key: 'long', title: 'long long long title' },
    { key: 'medium', title: 'medium title' },
  ]);

  const renderTabBar = (
    props: SceneRendererProps & { navigationState: NavigationState<Route> }
  ) => (
    <TabBar
      {...props}
      scrollEnabled
      style={[styles.containerTabbar]}
      contentContainerStyle={{
        // This will center the tab if there's only one
        justifyContent: routes.length === 1 ? 'center' : 'flex-start',
        paddingRight: 0,
      }}
      tabStyle={{
        width: 'auto',
      }}
      activeColor={'#fff'}
      inactiveColor={'#000'}
      indicatorStyle={styles.indicatorStyle}
      gap={20}
      direction={direction}
      renderIndicator={customTabInficator}
      renderTabBarItem={(itemProps) => {
        const { key, ...restProps } = itemProps;
        return (
          <CustomTabBarItem
            key={key}
            {...restProps}
            labelStyle={[styles.labelStyle, { maxWidth: windowWidth - 100 }]}
            labelProps={{ numberOfLines: 1 }}
          />
        );
      }}
    />
  );

  return (
    <TabView
      style={styles.containerTabview}
      navigationState={{ index, routes }}
      renderScene={renderScene}
      renderTabBar={renderTabBar}
      onIndexChange={setIndex}
      swipeEnabled={true}
      initialLayout={{ width: windowWidth }}
    />
  );
};

AutoWidthTabBar.options = {
  title: 'Scrollable tab bar (auto width)',
  headerShadowVisible: false,
  headerTintColor: '#fff',
  headerStyle: {
    backgroundColor: '#3f51b5',
  },
};

const styles = StyleSheet.create({
  tabbar: {
    backgroundColor: '#3f51b5',
  },
  tabbarContentContainer: {
    paddingHorizontal: 10,
  },
  indicator: {
    backgroundColor: '#ffeb3b',
  },
  tabStyle: {
    width: 'auto',
  },

  container: {
    flexDirection: 'column',
    alignItems: 'center',
    flex: 1,
    backgroundColor: '#fff',
  },
  containerTabview: { flex: 1, width: '100%' },
  containerTabbar: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    elevation: 0,
    shadowColor: 'transparent',
  },
  indicatorStyle: {
    height: '50%',
    top: '25%',
    bottom: '25%',
  },
  screenTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  newsList: {
    flex: 1,
    width: '100%',
    paddingHorizontal: '3%',
  },
  noItemsView: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noItemsText: {
    color: '#000',
    fontSize: 15,
  },
  labelStyle: { fontSize: 12, fontWeight: '500' },
});
