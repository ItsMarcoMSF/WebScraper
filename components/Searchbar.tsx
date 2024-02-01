"use client"

import { scrapeAndStoreProduct } from "@/lib/actions";
import { FormEvent, useState } from "react";
import { useRouter } from 'next/navigation'

const isValidAmazxonLink = (url: string) => {
  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname;

    // Check if the hostname is amazon.com or amazon.ca
    if(
      hostname.includes('amazon.com') ||
      hostname.includes('amazon.ca') ||
      hostname.includes('amazon.co.uk') ||
      hostname.endsWith('amazon')
    ) {
      return true;
    }
  } catch (error) {
    console.log(error);
    console.log('Invalid URL' + url);
    return false;
  }

  return false;
}

const Searchbar = () => {
  const router = useRouter();

  const [searchPrompt, setSearchPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    const isValidLink = isValidAmazxonLink(searchPrompt);

    if(!isValidLink) {
      alert('Please provide a valid Amazon link');
      return;
    }

    let productID;

    try {
      setIsLoading(true);

      // Scrape the project page
      productID = await scrapeAndStoreProduct(searchPrompt);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
      router.push(`/products/${productID}`);
    }
  }  

  return (
    <form
        className='flex flex-wrap gap-4 mt-12'
        onSubmit={handleSubmit}
    >
      <input
        type="text"
        value={searchPrompt}
        placeholder="Enter product link"
        className="searchbar-input"
        onChange={(e) => setSearchPrompt(e.target.value)}
      />

      <button
        type="submit"
        className="searchbar-btn"
        disabled={isLoading || searchPrompt === ''}
      >
        {isLoading ? 'Searching...' : 'Search'}
      </button>
    </form>
  )
}

export default Searchbar