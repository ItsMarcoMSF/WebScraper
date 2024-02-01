"use server";

import axios from "axios";
import * as cheerio from "cheerio";
import { extractPrice, extractCurrency, extractDescription } from "../utils";

export async function scrapeAmazonProduct(url: string) {
    if(!url){
        return;
    }

    // BrightData proxy configuration
    const username = String(process.env.BRIGHT_DATA_USERNAME);
    const password = String(process.env.BRIGHT_DATA_PASSWORD);
    const port = 22225;
    const session_id = (1000000 * Math.random()) | 0;
    
    const options = {
        auth: {
            username: `${username}-session-${session_id}`,
            password: password
        },
        host: 'brd.superproxy.io',
        port,
        rejectUnauthorized: false,
    }
    

    try {
        // Fetch the product page
        const response = await axios.get(url, options);
        const $ = cheerio.load(response.data);

        // Extract the product title
        const title = $("#productTitle").text().trim();
        const currentPrice = extractPrice(
            $("#corePrice_feature_div .a-offscreen").first(),
        );

        const originalPrice = extractPrice(
            $(".basisPrice .a-offscreen").first(),
        );

        const outOfStock = $("#availability .a-color-state").text().trim() === "Currently unavailable.";

        const images =
            $("#landingImage").attr("data-a-dynamic-image") ||
            $("#imgBlkFront").attr("data-a-dynamic-image") ||
            '{}';

        const imageUrls = Object.keys(JSON.parse(images));

        const currency = extractCurrency($('.a-price-symbol'))
        let discountRate = "";
        if (originalPrice && currentPrice) {
            discountRate = (((originalPrice - currentPrice) / originalPrice) * 100).toFixed(2);
        }

        const description = extractDescription($)

        const data = {
            url,
            currency: currency || "$",
            image: imageUrls[0],
            title,
            currentPrice: Number(currentPrice),
            originalPrice: Number(originalPrice),
            priceHistory: [],
            discountRate: Number(discountRate),
            category: "category",
            reviewsCount: 100,
            stars: 4.5,
            isOutOfStock: outOfStock,
            description,
            lowestPrice: Number(currentPrice) || Number(originalPrice),
            highestPrice: Number(originalPrice) || Number(currentPrice),
            averagePrice: Number(currentPrice) || Number(originalPrice),
        };

        return data;
    } catch (error: any) {
        throw new Error(`Failed to scrape product with url: [${url}]: ${error}`)
    }
}