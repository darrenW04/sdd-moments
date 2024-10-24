import React from 'react';
import { View, Text, FlatList, StyleSheet, Image, ListRenderItem } from 'react-native';

type Post = {
  id: string;
  user: string;
  caption: string;
  likes: number;
  imageUrl: string;
};

const FeedView = () => {
  const posts: Post[] = [
    { id: '1', user: 'user_name', caption: 'This is a test post', likes: 1234, imageUrl: 'https://via.placeholder.com/200' },
    { id: '2', user: 'another_user', caption: 'Another post', likes: 450, imageUrl: 'https://via.placeholder.com/200' },
    // Add more posts here
  ];

  const renderItem: ListRenderItem<Post> = ({ item }) => (
    <View style={styles.postContainer}>
      <Text style={styles.username}>{item.user}</Text>
      <Image source={{ uri: item.imageUrl }} style={styles.postImage} />
      <Text style={styles.caption}>{item.caption}</Text>
      <Text style={styles.likes}>Likes: {item.likes}</Text>
    </View>
  );

  return (
    <FlatList
      data={posts}
      keyExtractor={item => item.id}
      renderItem={renderItem}
    />
  );
};

const styles = StyleSheet.create({
  postContainer: {
    padding: 16,
    backgroundColor: '#000',
    marginBottom: 16,
  },
  username: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 8,
  },
  postImage: {
    width: '100%',
    height: 200,
    marginBottom: 8,
  },
  caption: {
    color: '#fff',
  },
  likes: {
    color: '#ccc',
    marginTop: 4,
  },
});

export default FeedView;
