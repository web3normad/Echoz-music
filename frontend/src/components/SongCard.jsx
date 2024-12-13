import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

export const SongCard = ({ song, subscription }) => {
  const isAccessible = !song.isPremium || (subscription && subscription.tier === 'premium');

  return (
    <Card className={`${!isAccessible ? 'opacity-50' : ''}`}>
      <CardHeader>
        <CardTitle>{song.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Artist: {song.artist}</p>
        <p>Album: {song.album}</p>
        {!isAccessible && (
          <div className="text-sm text-gray-500 mt-2">
            Premium access required
          </div>
        )}
      </CardContent>
    </Card>
  );
};