import React, { useState } from 'react';

const UploadMusic = () => {
  const [newRelease, setNewRelease] = useState({
    title: '',
    artist: '',
    image: '',
    year: '',
    songFile: null,
    albumCover: null,
    percentage: {
      platform: '',
      artist: '',
      investors: '',
    },
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewRelease((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setNewRelease((prevState) => ({
      ...prevState,
      [name]: files[0],
    }));
  };

  const handlePercentageChange = (e) => {
    const { name, value } = e.target;
    setNewRelease((prevState) => ({
      ...prevState,
      percentage: {
        ...prevState.percentage,
        [name]: value,
      },
    }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const totalPercentage =
      parseFloat(newRelease.percentage.platform) +
      parseFloat(newRelease.percentage.artist) +
      parseFloat(newRelease.percentage.investors);

    if (!newRelease.title || !newRelease.artist || !newRelease.year || !newRelease.songFile || !newRelease.albumCover) {
      alert('Please fill out all fields.');
      return;
    }

    if (totalPercentage !== 100) {
      alert('Total percentage allocation must equal 100%.');
      return;
    }

    // Here you would typically send the data to a backend or update a parent component
    console.log('New Release:', newRelease);

    // Reset form
    setNewRelease({
      title: '',
      artist: '',
      image: '',
      year: '',
      songFile: null,
      albumCover: null,
      percentage: {
        platform: '',
        artist: '',
        investors: '',
      },
    });
  };

  return (
    <div className="bg-white dark:bg-[#252727] rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-bold text-[#04e3cb] mb-4">Add New Release</h3>
      <form className="flex flex-col space-y-4" onSubmit={handleFormSubmit}>
        <input
          type="text"
          name="title"
          value={newRelease.title}
          placeholder="Track Title"
          className="p-3 bg-gray-100 dark:bg-[#151515] rounded-lg"
          onChange={handleInputChange}
        />
        <input
          type="text"
          name="artist"
          value={newRelease.artist}
          placeholder="Artist Name"
          className="p-3 bg-gray-100 dark:bg-[#151515] rounded-lg"
          onChange={handleInputChange}
        />
        <input
          type="number"
          name="year"
          value={newRelease.year}
          placeholder="Year of Release"
          className="p-3 bg-gray-100 dark:bg-[#151515] rounded-lg"
          onChange={handleInputChange}
        />
        <input
          type="file"
          name="songFile"
          accept=".mp3,.wav"
          className="p-3 bg-gray-100 dark:bg-[#151515] dark:text-white rounded-lg"
          onChange={handleFileChange}
        />
        <input
          type="file"
          name="albumCover"
          accept="image/*"
          className="p-3 bg-gray-100 dark:bg-[#151515] dark:text-white rounded-lg"
          onChange={handleFileChange}
        />
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-white">Percentage Allocation:</label>
          <input
            type="number"
            name="platform"
            value={newRelease.percentage.platform}
            placeholder="Platform (%)"
            className="w-full p-3 bg-gray-100 dark:bg-[#151515] rounded-lg mb-2"
            onChange={handlePercentageChange}
          />
          <input
            type="number"
            name="artist"
            value={newRelease.percentage.artist}
            placeholder="Artist (%)"
            className="w-full p-3 bg-gray-100 dark:bg-[#151515] rounded-lg mb-2"
            onChange={handlePercentageChange}
          />
          <input
            type="number"
            name="investors"
            value={newRelease.percentage.investors}
            placeholder="Investors (%)"
            className="w-full p-3 bg-gray-100 dark:bg-[#151515] rounded-lg"
            onChange={handlePercentageChange}
          />
        </div>
        <button
          type="submit"
          className="bg-[#04e3cb] text-black py-5 rounded-lg hover:bg-[#037e6a]"
        >
          Add Release
        </button>
      </form>
    </div>
  );
};

export default UploadMusic;