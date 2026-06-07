import React, { useState, useEffect, useRef, useMemo, useCallback, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Camera, ShoppingCart, Sparkles, ChevronRight, Filter, Star, Settings, Check, ArrowRight, Zap, Target, Users, Flame, Edit3, Pin, Save, X, Upload, Loader2, ChevronDown, MapPin, Tag, Mic, MicOff } from 'lucide-react';

/* ============================================================================
   COMMERCE ADAPTER LAYER
   Interface modeled on commercetools. Swap MockAdapter for a real adapter
   (commercetools, Shopify, custom OMS) by changing the `adapter` const below.
   ============================================================================ */

// ---- Demo catalog (stand-in for backend product service) -------------------
const CATALOG = [
  // ============================== HUNTING (16 SKUs) ==============================
  { id: 'h001', sku: 'VORTEX-DIAMONDBACK-SCOPE', name: "Vortex Diamondback 4-16x44 Rifle Scope", category: 'hunting', subcategory: 'optics', price: 349.99, compareAt: 399.99, brand: 'Vortex', rating: 4.7, reviews: 312, image: '🔭', photo: 'https://images.unsplash.com/photo-1595590424283-b8f17842773f?w=600&fit=crop&q=80', photos: ['https://images.unsplash.com/photo-1595590424283-b8f17842773f?w=800&q=80', 'https://images.unsplash.com/photo-1584086124851-c93d8f9bff39?w=800&q=80', 'https://images.unsplash.com/photo-1567102181473-ad48c4d52635?w=800&q=80', 'https://images.unsplash.com/photo-1493863641943-9b68992a8d07?w=800&q=80'], tags: ['premium', 'optics', 'deer-season'] },
  { id: 'h002', sku: 'AMERISTEP-BLIND-360', name: "Ameristep Care Taker 360 Ground Blind", category: 'hunting', subcategory: 'blinds', price: 189.99, brand: 'Ameristep', rating: 4.5, reviews: 188, image: '⛺', photo: 'https://images.unsplash.com/photo-1455763916899-e8b50eca9967?w=600&fit=crop&q=80', photos: ['https://images.unsplash.com/photo-1455763916899-e8b50eca9967?w=800&q=80', 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&q=80', 'https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?w=800&q=80', 'https://images.unsplash.com/photo-1537565266759-34bbc16be345?w=800&q=80'], tags: ['deer-season', 'concealment'] },
  { id: 'h003', sku: 'RAVIN-R26-CROSSBOW', name: "Ravin R26 Crossbow Package", category: 'hunting', subcategory: 'crossbows', price: 1199.99, brand: 'Ravin', rating: 4.8, reviews: 95, image: '🏹', photo: 'https://images.unsplash.com/photo-1545239351-cefa43af60f3?w=600&fit=crop&q=80', photos: ['https://images.unsplash.com/photo-1545239351-cefa43af60f3?w=800&q=80', 'https://images.unsplash.com/photo-1547721064-da6cfb341d50?w=800&q=80', 'https://images.unsplash.com/photo-1568438350562-2cae6d394ad0?w=800&q=80', 'https://images.unsplash.com/photo-1576508875213-87bbf9bcc4ec?w=800&q=80'], tags: ['premium', 'crossbows'] },
  { id: 'h004', sku: 'BARNETT-WHITETAIL-CROSSBOW', name: "Barnett Whitetail Hunter STR Crossbow", category: 'hunting', subcategory: 'crossbows', price: 379.99, brand: 'Barnett', rating: 4.3, reviews: 421, image: '🏹', photo: 'https://images.unsplash.com/photo-1547721064-da6cfb341d50?w=600&fit=crop&q=80', photos: ['https://images.unsplash.com/photo-1547721064-da6cfb341d50?w=800&q=80', 'https://images.unsplash.com/photo-1576508875213-87bbf9bcc4ec?w=800&q=80', 'https://images.unsplash.com/photo-1545239351-cefa43af60f3?w=800&q=80', 'https://images.unsplash.com/photo-1493863641943-9b68992a8d07?w=800&q=80'], tags: ['beginner', 'value', 'crossbows'] },
  { id: 'h005', sku: 'REALTREE-EDGE-JACKET', name: "Realtree Edge Insulated Hunting Jacket", category: 'hunting', subcategory: 'apparel', price: 89.99, brand: 'Realtree', rating: 4.4, reviews: 267, image: '🧥', photo: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=600&fit=crop&q=80', photos: ['https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=800&q=80', 'https://images.unsplash.com/photo-1606759616929-6d5b8d6e8b29?w=800&q=80', 'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=800&q=80', 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80'], tags: ['cold-weather', 'camo', 'apparel'] },
  { id: 'h006', sku: 'PRIMOS-DEER-CALL', name: "Primos Deer Call Bundle", category: 'hunting', subcategory: 'calls', price: 34.99, brand: 'Primos', rating: 4.6, reviews: 144, image: '📯', photo: 'https://images.unsplash.com/photo-1551272744-3c1b39daacbe?w=600&fit=crop&q=80', photos: ['https://images.unsplash.com/photo-1551272744-3c1b39daacbe?w=800&q=80', 'https://images.unsplash.com/photo-1493863641943-9b68992a8d07?w=800&q=80', 'https://images.unsplash.com/photo-1606639386377-7eb78f9b0571?w=800&q=80', 'https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?w=800&q=80'], tags: ['calls'] },
  { id: 'h007', sku: 'MUCK-WETLAND-BOOTS', name: "Muck Wetland Camo Hunting Boots", category: 'hunting', subcategory: 'footwear', price: 174.99, brand: 'Muck', rating: 4.7, reviews: 502, image: '🥾', photo: 'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=600&fit=crop&q=80', photos: ['https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=800&q=80', 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80', 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=800&q=80', 'https://images.unsplash.com/photo-1493863641943-9b68992a8d07?w=800&q=80'], tags: ['waterproof', 'cold-weather', 'footwear'] },
  { id: 'h008', sku: 'MILLENNIUM-TREESTAND', name: "Millennium Lock-On Tree Stand", category: 'hunting', subcategory: 'stands', price: 229.99, brand: 'Millennium', rating: 4.6, reviews: 78, image: '🪜', photo: 'https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?w=600&fit=crop&q=80', photos: ['https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?w=800&q=80', 'https://images.unsplash.com/photo-1455763916899-e8b50eca9967?w=800&q=80', 'https://images.unsplash.com/photo-1493863641943-9b68992a8d07?w=800&q=80', 'https://images.unsplash.com/photo-1606639386377-7eb78f9b0571?w=800&q=80'], tags: ['stands'] },
  { id: 'h009', sku: 'VORTEX-BINOCULARS-10X42', name: "Vortex Crossfire HD 10x42 Binoculars", category: 'hunting', subcategory: 'optics', price: 199.99, brand: 'Vortex', rating: 4.8, reviews: 891, image: '🔭', photo: 'https://images.unsplash.com/photo-1521119989659-a83eee488004?w=600&fit=crop&q=80', photos: ['https://images.unsplash.com/photo-1521119989659-a83eee488004?w=800&q=80', 'https://images.unsplash.com/photo-1568051243851-f9b136146e97?w=800&q=80', 'https://images.unsplash.com/photo-1595590424283-b8f17842773f?w=800&q=80', 'https://images.unsplash.com/photo-1493863641943-9b68992a8d07?w=800&q=80'], tags: ['premium', 'optics'] },
  { id: 'h010', sku: 'RUGER-AR556-RIFLE', name: "Ruger AR-556 Rifle", category: 'hunting', subcategory: 'firearms', price: 899.99, brand: 'Ruger', rating: 4.6, reviews: 234, image: '🔫', photo: 'https://images.unsplash.com/photo-1567102181473-ad48c4d52635?w=600&fit=crop&q=80', photos: ['https://images.unsplash.com/photo-1567102181473-ad48c4d52635?w=800&q=80', 'https://images.unsplash.com/photo-1595590424283-b8f17842773f?w=800&q=80', 'https://images.unsplash.com/photo-1568010967150-1ec5957f00fb?w=800&q=80', 'https://images.unsplash.com/photo-1493863641943-9b68992a8d07?w=800&q=80'], tags: ['premium', 'firearms'] },
  { id: 'h011', sku: 'FEDERAL-3006-AMMO', name: "Federal Premium .30-06 Ammunition 20-pack", category: 'hunting', subcategory: 'ammunition', price: 39.99, brand: 'Federal', rating: 4.8, reviews: 567, image: '🎯', photo: 'https://images.unsplash.com/photo-1595590424283-b8f17842773f?w=600&fit=crop&q=80', photos: ['https://images.unsplash.com/photo-1595590424283-b8f17842773f?w=800&q=80', 'https://images.unsplash.com/photo-1567102181473-ad48c4d52635?w=800&q=80', 'https://images.unsplash.com/photo-1493863641943-9b68992a8d07?w=800&q=80', 'https://images.unsplash.com/photo-1606639386377-7eb78f9b0571?w=800&q=80'], tags: ['ammunition'] },
  { id: 'h012', sku: 'ALPS-COMMANDER-PACK', name: "Alps OutdoorZ Commander Hunting Pack", category: 'hunting', subcategory: 'apparel', price: 159.99, brand: 'Alps OutdoorZ', rating: 4.5, reviews: 187, image: '🎒', photo: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&fit=crop&q=80', photos: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80', 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&q=80', 'https://images.unsplash.com/photo-1622260614153-03223fb72052?w=800&q=80', 'https://images.unsplash.com/photo-1493863641943-9b68992a8d07?w=800&q=80'], tags: ['camo'] },
  { id: 'h013', sku: 'BUCK-119-KNIFE', name: "Buck Knives 119 Special Fixed Blade", category: 'hunting', subcategory: 'tools', price: 89.99, brand: 'Buck', rating: 4.9, reviews: 1432, image: '🔪', photo: 'https://images.unsplash.com/photo-1591375275624-c63ad55ce3b8?w=600&fit=crop&q=80', photos: ['https://images.unsplash.com/photo-1591375275624-c63ad55ce3b8?w=800&q=80', 'https://images.unsplash.com/photo-1568010967150-1ec5957f00fb?w=800&q=80', 'https://images.unsplash.com/photo-1493863641943-9b68992a8d07?w=800&q=80', 'https://images.unsplash.com/photo-1606639386377-7eb78f9b0571?w=800&q=80'], tags: ['tools'] },
  { id: 'h014', sku: 'STREAMLIGHT-PROTAC', name: "Streamlight ProTac HL-X Tactical Light", category: 'hunting', subcategory: 'tools', price: 119.99, brand: 'Streamlight', rating: 4.7, reviews: 312, image: '🔦', photo: 'https://images.unsplash.com/photo-1568010967150-1ec5957f00fb?w=600&fit=crop&q=80', photos: ['https://images.unsplash.com/photo-1568010967150-1ec5957f00fb?w=800&q=80', 'https://images.unsplash.com/photo-1591375275624-c63ad55ce3b8?w=800&q=80', 'https://images.unsplash.com/photo-1606639386377-7eb78f9b0571?w=800&q=80', 'https://images.unsplash.com/photo-1493863641943-9b68992a8d07?w=800&q=80'], tags: ['tools'] },
  { id: 'h015', sku: 'RECONYX-TRAIL-CAM', name: "Reconyx HyperFire 2 Trail Camera", category: 'hunting', subcategory: 'optics', price: 449.99, brand: 'Reconyx', rating: 4.6, reviews: 156, image: '📷', photo: 'https://images.unsplash.com/photo-1606639386377-7eb78f9b0571?w=600&fit=crop&q=80', photos: ['https://images.unsplash.com/photo-1606639386377-7eb78f9b0571?w=800&q=80', 'https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?w=800&q=80', 'https://images.unsplash.com/photo-1493863641943-9b68992a8d07?w=800&q=80', 'https://images.unsplash.com/photo-1521119989659-a83eee488004?w=800&q=80'], tags: ['premium', 'deer-season', 'optics'] },
  { id: 'h016', sku: 'HOT-SHOT-GLOVES', name: "Hot Shot Thinsulate Hunting Gloves", category: 'hunting', subcategory: 'apparel', price: 24.99, brand: 'Hot Shot', rating: 4.3, reviews: 89, image: '🧤', photo: 'https://images.unsplash.com/photo-1606759616929-6d5b8d6e8b29?w=600&fit=crop&q=80', photos: ['https://images.unsplash.com/photo-1606759616929-6d5b8d6e8b29?w=800&q=80', 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=800&q=80', 'https://images.unsplash.com/photo-1493863641943-9b68992a8d07?w=800&q=80', 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80'], tags: ['cold-weather'] },
  // ============================== TEAM SPORTS / YOUTH (14 SKUs) ==============================
  { id: 't001', sku: 'NIKE-JR-PHANTOM-CLEATS', name: "Nike Jr. Phantom GX Firm Ground Soccer Cleats", category: 'team-sports', subcategory: 'soccer', price: 64.99, brand: 'Nike', rating: 4.6, reviews: 218, image: '⚽', photo: 'https://images.unsplash.com/photo-1511886929837-354d827aae26?w=600&fit=crop&q=80', photos: ['https://images.unsplash.com/photo-1511886929837-354d827aae26?w=800&q=80', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80', 'https://images.unsplash.com/photo-1614632537190-23e4146777db?w=800&q=80', 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80'], tags: ['youth', 'soccer', 'firm-ground'] },
  { id: 't002', sku: 'ADIDAS-MLS-BALL', name: "Adidas MLS Match Soccer Ball Size 4", category: 'team-sports', subcategory: 'soccer', price: 39.99, brand: 'Adidas', rating: 4.5, reviews: 156, image: '⚽', photo: 'https://images.unsplash.com/photo-1614632537190-23e4146777db?w=600&fit=crop&q=80', photos: ['https://images.unsplash.com/photo-1614632537190-23e4146777db?w=800&q=80', 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80', 'https://images.unsplash.com/photo-1511886929837-354d827aae26?w=800&q=80', 'https://images.unsplash.com/photo-1518604666860-9ed391f76460?w=800&q=80'], tags: ['youth', 'size-4'] },
  { id: 't003', sku: 'NIKE-SHIN-GUARDS', name: "Nike Charge Youth Shin Guards", category: 'team-sports', subcategory: 'soccer', price: 17.99, brand: 'Nike', rating: 4.4, reviews: 89, image: '🛡️', photo: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&fit=crop&q=80', photos: ['https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80', 'https://images.unsplash.com/photo-1511886929837-354d827aae26?w=800&q=80', 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=800&q=80', 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80'], tags: ['youth'] },
  { id: 't004', sku: 'ADIDAS-SOCCER-SOCKS', name: "Adidas Youth Soccer Socks 3-Pack", category: 'team-sports', subcategory: 'soccer', price: 14.99, brand: 'Adidas', rating: 4.5, reviews: 64, image: '🧦', photo: 'https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?w=600&fit=crop&q=80', photos: ['https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?w=800&q=80', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80', 'https://images.unsplash.com/photo-1511886929837-354d827aae26?w=800&q=80', 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80'], tags: ['youth'] },
  { id: 't005', sku: 'HYDROFLASK-32OZ', name: "Hydro Flask 32oz Water Bottle", category: 'team-sports', subcategory: 'accessories', price: 44.99, brand: 'Hydro Flask', rating: 4.7, reviews: 332, image: '💧', photo: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&fit=crop&q=80', photos: ['https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&q=80', 'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=800&q=80', 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80', 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80'], tags: ['accessories'] },
  { id: 't006', sku: 'NIKE-BRASILIA-DUFFEL', name: "Nike Brasilia Youth Duffel Bag", category: 'team-sports', subcategory: 'accessories', price: 34.99, brand: 'Nike', rating: 4.6, reviews: 201, image: '🎒', photo: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&fit=crop&q=80', photos: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80', 'https://images.unsplash.com/photo-1622260614153-03223fb72052?w=800&q=80', 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80', 'https://images.unsplash.com/photo-1511886929837-354d827aae26?w=800&q=80'], tags: ['youth'] },
  { id: 't007', sku: 'EASTON-BASEBALL-BAT', name: "Easton ADV 360 USA Baseball Bat", category: 'team-sports', subcategory: 'baseball', price: 299.99, compareAt: 349.99, brand: 'Easton', rating: 4.7, reviews: 142, image: '🥎', photo: 'https://images.unsplash.com/photo-1607627000458-210e8d2bdb1d?w=600&fit=crop&q=80', photos: ['https://images.unsplash.com/photo-1607627000458-210e8d2bdb1d?w=800&q=80', 'https://images.unsplash.com/photo-1471295253337-3ceaaedca402?w=800&q=80', 'https://images.unsplash.com/photo-1508344928928-7165b67de128?w=800&q=80', 'https://images.unsplash.com/photo-1583500178690-f7d24c6bcbcc?w=800&q=80'], tags: ['youth', 'baseball', 'deal'] },
  { id: 't008', sku: 'RAWLINGS-GLOVE', name: "Rawlings Playmaker Baseball Glove", category: 'team-sports', subcategory: 'baseball', price: 49.99, brand: 'Rawlings', rating: 4.5, reviews: 318, image: '⚾', photo: 'https://images.unsplash.com/photo-1508344928928-7165b67de128?w=600&fit=crop&q=80', photos: ['https://images.unsplash.com/photo-1508344928928-7165b67de128?w=800&q=80', 'https://images.unsplash.com/photo-1583500178690-f7d24c6bcbcc?w=800&q=80', 'https://images.unsplash.com/photo-1607627000458-210e8d2bdb1d?w=800&q=80', 'https://images.unsplash.com/photo-1471295253337-3ceaaedca402?w=800&q=80'], tags: ['youth', 'baseball'] },
  { id: 't009', sku: 'SPALDING-BASKETBALL', name: "Spalding NBA Indoor Basketball", category: 'team-sports', subcategory: 'basketball', price: 39.99, brand: 'Spalding', rating: 4.8, reviews: 1023, image: '🏀', photo: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=600&fit=crop&q=80', photos: ['https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&q=80', 'https://images.unsplash.com/photo-1519861531473-9200262188bf?w=800&q=80', 'https://images.unsplash.com/photo-1518063319789-7217e6706b04?w=800&q=80', 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80'], tags: ['basketball'] },
  { id: 't010', sku: 'LIFETIME-BASKETBALL-HOOP', name: "Lifetime 54-inch Portable Basketball Hoop", category: 'team-sports', subcategory: 'basketball', price: 299.99, brand: 'Lifetime', rating: 4.4, reviews: 487, image: '🏀', photo: 'https://images.unsplash.com/photo-1519861531473-9200262188bf?w=600&fit=crop&q=80', photos: ['https://images.unsplash.com/photo-1519861531473-9200262188bf?w=800&q=80', 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&q=80', 'https://images.unsplash.com/photo-1518063319789-7217e6706b04?w=800&q=80', 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80'], tags: ['basketball'] },
  { id: 't011', sku: 'WILSON-FOOTBALL', name: "Wilson NCAA Composite Football", category: 'team-sports', subcategory: 'football', price: 29.99, brand: 'Wilson', rating: 4.6, reviews: 412, image: '🏈', photo: 'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=600&fit=crop&q=80', photos: ['https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=800&q=80', 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80', 'https://images.unsplash.com/photo-1518604666860-9ed391f76460?w=800&q=80', 'https://images.unsplash.com/photo-1607627000458-210e8d2bdb1d?w=800&q=80'], tags: ['football'] },
  { id: 't012', sku: 'SPALDING-CONES', name: "Spalding Training Cones Set of 12", category: 'team-sports', subcategory: 'accessories', price: 12.99, brand: 'Spalding', rating: 4.3, reviews: 256, image: '🔶', photo: 'https://images.unsplash.com/photo-1518604666860-9ed391f76460?w=600&fit=crop&q=80', photos: ['https://images.unsplash.com/photo-1518604666860-9ed391f76460?w=800&q=80', 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80', 'https://images.unsplash.com/photo-1511886929837-354d827aae26?w=800&q=80', 'https://images.unsplash.com/photo-1614632537190-23e4146777db?w=800&q=80'], tags: ['training'] },
  { id: 't013', sku: 'NIKE-JERSEY-YOUTH', name: "Nike Park VII Youth Soccer Jersey", category: 'team-sports', subcategory: 'soccer', price: 27.99, brand: 'Nike', rating: 4.5, reviews: 178, image: '👕', photo: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=600&fit=crop&q=80', photos: ['https://images.unsplash.com/photo-1556906781-9a412961c28c?w=800&q=80', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80', 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80', 'https://images.unsplash.com/photo-1614632537190-23e4146777db?w=800&q=80'], tags: ['youth', 'soccer'] },
  { id: 't014', sku: 'DEMARINI-VOODOO-BAT', name: "DeMarini Voodoo One USSSA Bat", category: 'team-sports', subcategory: 'baseball', price: 349.99, brand: 'DeMarini', rating: 4.8, reviews: 89, image: '🥎', photo: 'https://images.unsplash.com/photo-1471295253337-3ceaaedca402?w=600&fit=crop&q=80', photos: ['https://images.unsplash.com/photo-1471295253337-3ceaaedca402?w=800&q=80', 'https://images.unsplash.com/photo-1607627000458-210e8d2bdb1d?w=800&q=80', 'https://images.unsplash.com/photo-1508344928928-7165b67de128?w=800&q=80', 'https://images.unsplash.com/photo-1583500178690-f7d24c6bcbcc?w=800&q=80'], tags: ['premium', 'baseball'] },
  // ============================== FITNESS (16 SKUs) ==============================
  { id: 'f001', sku: 'BROOKS-GHOST-15', name: "Brooks Ghost 15 Neutral Running Shoes", category: 'fitness', subcategory: 'footwear', price: 119.99, compareAt: 139.99, brand: 'Brooks', rating: 4.8, reviews: 1204, image: '👟', photo: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&fit=crop&q=80', photos: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80', 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&q=80', 'https://images.unsplash.com/photo-1597248374161-426f3d6e0d35?w=800&q=80', 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=800&q=80'], tags: ['neutral', 'cushion', 'deal', 'footwear'] },
  { id: 'f002', sku: 'ASICS-KAYANO-30', name: "ASICS Gel-Kayano 30 Stability Runners", category: 'fitness', subcategory: 'footwear', price: 159.99, compareAt: 179.99, brand: 'ASICS', rating: 4.7, reviews: 678, image: '👟', photo: 'https://images.unsplash.com/photo-1539185441755-769473a23570?w=600&fit=crop&q=80', photos: ['https://images.unsplash.com/photo-1539185441755-769473a23570?w=800&q=80', 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&q=80', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80', 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=800&q=80'], tags: ['stability', 'flat-feet', 'overpronation', 'footwear'] },
  { id: 'f003', sku: 'HOKA-ARAHI-7', name: "Hoka Arahi 7 Stability Running Shoes", category: 'fitness', subcategory: 'footwear', price: 144.99, brand: 'Hoka', rating: 4.6, reviews: 412, image: '👟', photo: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&fit=crop&q=80', photos: ['https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&q=80', 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&q=80', 'https://images.unsplash.com/photo-1539185441755-769473a23570?w=800&q=80', 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=800&q=80'], tags: ['stability', 'flat-feet', 'footwear'] },
  { id: 'f004', sku: 'CAP-DUMBBELL-SET', name: "CAP Barbell Dumbbell Set 5-25 lb", category: 'fitness', subcategory: 'weights', price: 199.99, compareAt: 249.99, brand: 'CAP', rating: 4.5, reviews: 287, image: '🏋️', photo: 'https://images.unsplash.com/photo-1638536532686-d610adfc8e5c?w=600&fit=crop&q=80', photos: ['https://images.unsplash.com/photo-1638536532686-d610adfc8e5c?w=800&q=80', 'https://images.unsplash.com/photo-1517344884509-a0c97ec11bcc?w=800&q=80', 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80', 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800&q=80'], tags: ['deal', 'home-gym', 'weights'] },
  { id: 'f005', sku: 'NIKE-DRI-FIT-TEE', name: "Nike Dri-FIT Training Tee", category: 'fitness', subcategory: 'apparel', price: 24.99, compareAt: 34.99, brand: 'Nike', rating: 4.7, reviews: 542, image: '👕', photo: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=600&fit=crop&q=80', photos: ['https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800&q=80', 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=800&q=80', 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80'], tags: ['deal', 'apparel'] },
  { id: 'f006', sku: 'MANDUKA-YOGA-MAT', name: "Manduka Pro Yoga Mat 6mm", category: 'fitness', subcategory: 'accessories', price: 89.99, brand: 'Manduka', rating: 4.8, reviews: 856, image: '🧘', photo: 'https://images.unsplash.com/photo-1599447421416-3414500d18a5?w=600&fit=crop&q=80', photos: ['https://images.unsplash.com/photo-1599447421416-3414500d18a5?w=800&q=80', 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=800&q=80', 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80', 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800&q=80'], tags: ['premium', 'accessories'] },
  { id: 'f007', sku: 'NIKE-PEGASUS-40', name: "Nike Pegasus 40 Running Shoes", category: 'fitness', subcategory: 'footwear', price: 129.99, brand: 'Nike', rating: 4.7, reviews: 923, image: '👟', photo: 'https://images.unsplash.com/photo-1597248374161-426f3d6e0d35?w=600&fit=crop&q=80', photos: ['https://images.unsplash.com/photo-1597248374161-426f3d6e0d35?w=800&q=80', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80', 'https://images.unsplash.com/photo-1539185441755-769473a23570?w=800&q=80', 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=800&q=80'], tags: ['neutral', 'cushion', 'footwear'] },
  { id: 'f008', sku: 'NB-FUELCELL-RACING', name: "New Balance FuelCell SC v4 Racing Shoes", category: 'fitness', subcategory: 'footwear', price: 229.99, brand: 'New Balance', rating: 4.6, reviews: 156, image: '👟', photo: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&fit=crop&q=80', photos: ['https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&q=80', 'https://images.unsplash.com/photo-1539185441755-769473a23570?w=800&q=80', 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&q=80', 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=800&q=80'], tags: ['premium', 'racing', 'footwear'] },
  { id: 'f009', sku: 'RESISTANCE-BANDS-SET', name: "Resistance Bands Set with Door Anchor", category: 'fitness', subcategory: 'accessories', price: 29.99, compareAt: 39.99, brand: 'Bodylastics', rating: 4.6, reviews: 1872, image: '🎗️', photo: 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=600&fit=crop&q=80', photos: ['https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=800&q=80', 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80', 'https://images.unsplash.com/photo-1517344884509-a0c97ec11bcc?w=800&q=80', 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800&q=80'], tags: ['deal', 'home-gym'] },
  { id: 'f010', sku: 'CAP-KETTLEBELL-35', name: "CAP 35lb Cast Iron Kettlebell", category: 'fitness', subcategory: 'weights', price: 69.99, brand: 'CAP', rating: 4.7, reviews: 543, image: '🏋️', photo: 'https://images.unsplash.com/photo-1517344884509-a0c97ec11bcc?w=600&fit=crop&q=80', photos: ['https://images.unsplash.com/photo-1517344884509-a0c97ec11bcc?w=800&q=80', 'https://images.unsplash.com/photo-1638536532686-d610adfc8e5c?w=800&q=80', 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80', 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=800&q=80'], tags: ['home-gym'] },
  { id: 'f011', sku: 'WEIDER-BENCH', name: "Weider Adjustable Weight Bench", category: 'fitness', subcategory: 'equipment', price: 149.99, compareAt: 189.99, brand: 'Weider', rating: 4.4, reviews: 318, image: '🪑', photo: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&fit=crop&q=80', photos: ['https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80', 'https://images.unsplash.com/photo-1638536532686-d610adfc8e5c?w=800&q=80', 'https://images.unsplash.com/photo-1517344884509-a0c97ec11bcc?w=800&q=80', 'https://images.unsplash.com/photo-1591291621164-2c6367723315?w=800&q=80'], tags: ['deal', 'home-gym'] },
  { id: 'f012', sku: 'NORDICTRACK-TREADMILL', name: "NordicTrack T 6.5 S Treadmill", category: 'fitness', subcategory: 'equipment', price: 799.99, compareAt: 999.99, brand: 'NordicTrack', rating: 4.5, reviews: 412, image: '🏃', photo: 'https://images.unsplash.com/photo-1591291621164-2c6367723315?w=600&fit=crop&q=80', photos: ['https://images.unsplash.com/photo-1591291621164-2c6367723315?w=800&q=80', 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80', 'https://images.unsplash.com/photo-1597248374161-426f3d6e0d35?w=800&q=80'], tags: ['deal', 'home-gym', 'premium'] },
  { id: 'f013', sku: 'UA-TRAINING-SHORTS', name: "Under Armour Raid 2.0 Training Shorts", category: 'fitness', subcategory: 'apparel', price: 29.99, brand: 'Under Armour', rating: 4.5, reviews: 287, image: '🩳', photo: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=600&fit=crop&q=80', photos: ['https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800&q=80', 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=800&q=80', 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80', 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&q=80'], tags: ['apparel'] },
  { id: 'f014', sku: 'LULULEMON-ALIGN-LEGGINGS', name: "Lululemon Align High-Rise Leggings", category: 'fitness', subcategory: 'apparel', price: 98.0, brand: 'Lululemon', rating: 4.9, reviews: 2341, image: '👖', photo: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=600&fit=crop&q=80', photos: ['https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=800&q=80', 'https://images.unsplash.com/photo-1599447421416-3414500d18a5?w=800&q=80', 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800&q=80', 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80'], tags: ['premium', 'apparel'] },
  { id: 'f015', sku: 'GARMIN-FORERUNNER-265', name: "Garmin Forerunner 265 GPS Running Watch", category: 'fitness', subcategory: 'electronics', price: 449.99, brand: 'Garmin', rating: 4.8, reviews: 234, image: '⌚', photo: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=600&fit=crop&q=80', photos: ['https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&q=80', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80', 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=800&q=80', 'https://images.unsplash.com/photo-1597248374161-426f3d6e0d35?w=800&q=80'], tags: ['premium', 'electronics'] },
  { id: 'f016', sku: 'PELOTON-BIKE', name: "Peloton Bike Indoor Cycle", category: 'fitness', subcategory: 'equipment', price: 1445.0, brand: 'Peloton', rating: 4.7, reviews: 5234, image: '🚴', photo: 'https://images.unsplash.com/photo-1591291621164-2c6367723315?w=600&fit=crop&q=80', photos: ['https://images.unsplash.com/photo-1591291621164-2c6367723315?w=800&q=80', 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80', 'https://images.unsplash.com/photo-1599447421416-3414500d18a5?w=800&q=80'], tags: ['premium', 'home-gym'] },
  // ============================== CAMPING (12 SKUs) ==============================
  { id: 'c001', sku: 'COLEMAN-SUNDOME-TENT', name: "Coleman Sundome 6-Person Tent", category: 'camping', subcategory: 'shelter', price: 149.99, brand: 'Coleman', rating: 4.5, reviews: 1820, image: '⛺', photo: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600&fit=crop&q=80', photos: ['https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&q=80', 'https://images.unsplash.com/photo-1537565266759-34bbc16be345?w=800&q=80', 'https://images.unsplash.com/photo-1455496231601-e6195da1f841?w=800&q=80', 'https://images.unsplash.com/photo-1521215037309-d29f9e8bf76e?w=800&q=80'], tags: ['shelter'] },
  { id: 'c002', sku: 'COLEMAN-SLEEPING-BAG', name: "Coleman Brazos 30F Sleeping Bag", category: 'camping', subcategory: 'sleep', price: 39.99, brand: 'Coleman', rating: 4.4, reviews: 743, image: '🛏️', photo: 'https://images.unsplash.com/photo-1455496231601-e6195da1f841?w=600&fit=crop&q=80', photos: ['https://images.unsplash.com/photo-1455496231601-e6195da1f841?w=800&q=80', 'https://images.unsplash.com/photo-1537565266759-34bbc16be345?w=800&q=80', 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&q=80', 'https://images.unsplash.com/photo-1521215037309-d29f9e8bf76e?w=800&q=80'], tags: ['sleep'] },
  { id: 'c003', sku: 'MAGELLAN-CHAIRS', name: "Magellan Outdoors 4-Pack Camp Chair Set", category: 'camping', subcategory: 'furniture', price: 79.99, brand: 'Magellan', rating: 4.6, reviews: 421, image: '🪑', photo: 'https://images.unsplash.com/photo-1504851149312-7a075b496cc7?w=600&fit=crop&q=80', photos: ['https://images.unsplash.com/photo-1504851149312-7a075b496cc7?w=800&q=80', 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&q=80', 'https://images.unsplash.com/photo-1537565266759-34bbc16be345?w=800&q=80', 'https://images.unsplash.com/photo-1521215037309-d29f9e8bf76e?w=800&q=80'], tags: ['furniture'] },
  { id: 'c004', sku: 'YETI-TUNDRA-45', name: "YETI Tundra 45 Hard Cooler", category: 'camping', subcategory: 'coolers', price: 325.0, brand: 'YETI', rating: 4.9, reviews: 612, image: '🧊', photo: 'https://images.unsplash.com/photo-1620656798932-902a8a9f5f96?w=600&fit=crop&q=80', photos: ['https://images.unsplash.com/photo-1620656798932-902a8a9f5f96?w=800&q=80', 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=800&q=80', 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&q=80', 'https://images.unsplash.com/photo-1537565266759-34bbc16be345?w=800&q=80'], tags: ['premium', 'coolers'] },
  { id: 'c005', sku: 'COLEMAN-STOVE', name: "Coleman Classic 2-Burner Camp Stove", category: 'camping', subcategory: 'cooking', price: 59.99, brand: 'Coleman', rating: 4.7, reviews: 988, image: '🔥', photo: 'https://images.unsplash.com/photo-1521215037309-d29f9e8bf76e?w=600&fit=crop&q=80', photos: ['https://images.unsplash.com/photo-1521215037309-d29f9e8bf76e?w=800&q=80', 'https://images.unsplash.com/photo-1604542030929-bd8c1a937a45?w=800&q=80', 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&q=80', 'https://images.unsplash.com/photo-1537565266759-34bbc16be345?w=800&q=80'], tags: ['cooking'] },
  { id: 'c006', sku: 'NORTHBOUND-BACKPACKING-TENT', name: "NorthBound 4-Person Backpacking Tent", category: 'camping', subcategory: 'shelter', price: 199.99, brand: 'NorthBound', rating: 4.5, reviews: 287, image: '⛺', photo: 'https://images.unsplash.com/photo-1537565266759-34bbc16be345?w=600&fit=crop&q=80', photos: ['https://images.unsplash.com/photo-1537565266759-34bbc16be345?w=800&q=80', 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&q=80', 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&q=80', 'https://images.unsplash.com/photo-1622260614153-03223fb72052?w=800&q=80'], tags: ['shelter'] },
  { id: 'c007', sku: 'THERMAREST-PAD', name: "Therm-a-Rest ProLite Sleeping Pad", category: 'camping', subcategory: 'sleep', price: 89.99, brand: 'Therm-a-Rest', rating: 4.7, reviews: 412, image: '🛏️', photo: 'https://images.unsplash.com/photo-1455496231601-e6195da1f841?w=600&fit=crop&q=80', photos: ['https://images.unsplash.com/photo-1455496231601-e6195da1f841?w=800&q=80', 'https://images.unsplash.com/photo-1537565266759-34bbc16be345?w=800&q=80', 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&q=80', 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&q=80'], tags: ['premium', 'sleep'] },
  { id: 'c008', sku: 'COLEMAN-LANTERN', name: "Coleman 1000-Lumen LED Lantern", category: 'camping', subcategory: 'lighting', price: 49.99, brand: 'Coleman', rating: 4.6, reviews: 567, image: '🏮', photo: 'https://images.unsplash.com/photo-1521215037309-d29f9e8bf76e?w=600&fit=crop&q=80', photos: ['https://images.unsplash.com/photo-1521215037309-d29f9e8bf76e?w=800&q=80', 'https://images.unsplash.com/photo-1537565266759-34bbc16be345?w=800&q=80', 'https://images.unsplash.com/photo-1604542030929-bd8c1a937a45?w=800&q=80', 'https://images.unsplash.com/photo-1568010967150-1ec5957f00fb?w=800&q=80'], tags: ['lighting'] },
  { id: 'c009', sku: 'YETI-ROADIE-24', name: "YETI Roadie 24 Cooler", category: 'camping', subcategory: 'coolers', price: 199.99, brand: 'YETI', rating: 4.8, reviews: 412, image: '🧊', photo: 'https://images.unsplash.com/photo-1620656798932-902a8a9f5f96?w=600&fit=crop&q=80', photos: ['https://images.unsplash.com/photo-1620656798932-902a8a9f5f96?w=800&q=80', 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=800&q=80', 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&q=80', 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&q=80'], tags: ['premium', 'coolers'] },
  { id: 'c010', sku: 'OSPREY-ATMOS-50', name: "Osprey Atmos AG 50 Backpack", category: 'camping', subcategory: 'packs', price: 280.0, brand: 'Osprey', rating: 4.9, reviews: 823, image: '🎒', photo: 'https://images.unsplash.com/photo-1622260614153-03223fb72052?w=600&fit=crop&q=80', photos: ['https://images.unsplash.com/photo-1622260614153-03223fb72052?w=800&q=80', 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&q=80', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80', 'https://images.unsplash.com/photo-1537565266759-34bbc16be345?w=800&q=80'], tags: ['premium', 'packs'] },
  { id: 'c011', sku: 'JETBOIL-FLASH', name: "Jetboil Flash Cooking System", category: 'camping', subcategory: 'cooking', price: 119.99, brand: 'Jetboil', rating: 4.7, reviews: 1287, image: '🔥', photo: 'https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?w=600&fit=crop&q=80', photos: ['https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?w=800&q=80', 'https://images.unsplash.com/photo-1521215037309-d29f9e8bf76e?w=800&q=80', 'https://images.unsplash.com/photo-1604542030929-bd8c1a937a45?w=800&q=80', 'https://images.unsplash.com/photo-1537565266759-34bbc16be345?w=800&q=80'], tags: ['cooking'] },
  { id: 'c012', sku: 'KELTY-TARP', name: "Kelty Noahs Tarp 12", category: 'camping', subcategory: 'shelter', price: 89.99, brand: 'Kelty', rating: 4.5, reviews: 234, image: '⛱️', photo: 'https://images.unsplash.com/photo-1537565266759-34bbc16be345?w=600&fit=crop&q=80', photos: ['https://images.unsplash.com/photo-1537565266759-34bbc16be345?w=800&q=80', 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&q=80', 'https://images.unsplash.com/photo-1455496231601-e6195da1f841?w=800&q=80', 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&q=80'], tags: ['shelter'] },
  // ============================== FISHING (12 SKUs) ==============================
  { id: 'fi001', sku: 'UGLY-STIK-ROD', name: "Shakespeare Ugly Stik GX2 7ft Rod", category: 'fishing', subcategory: 'rods', price: 39.99, brand: 'Shakespeare', rating: 4.7, reviews: 2341, image: '🎣', photo: 'https://images.unsplash.com/photo-1611089564888-3eedbb4f088c?w=600&fit=crop&q=80', photos: ['https://images.unsplash.com/photo-1611089564888-3eedbb4f088c?w=800&q=80', 'https://images.unsplash.com/photo-1545580017-fa4c01292e1c?w=800&q=80', 'https://images.unsplash.com/photo-1545056453-f0359c3df6db?w=800&q=80', 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80'], tags: ['beginner', 'value', 'rods'] },
  { id: 'fi002', sku: 'PENN-BATTLE-REEL', name: "Penn Battle III Spinning Reel 4000", category: 'fishing', subcategory: 'reels', price: 159.99, brand: 'Penn', rating: 4.8, reviews: 567, image: '🎣', photo: 'https://images.unsplash.com/photo-1545056453-f0359c3df6db?w=600&fit=crop&q=80', photos: ['https://images.unsplash.com/photo-1545056453-f0359c3df6db?w=800&q=80', 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80', 'https://images.unsplash.com/photo-1611089564888-3eedbb4f088c?w=800&q=80', 'https://images.unsplash.com/photo-1485451187253-ba80d54f1e62?w=800&q=80'], tags: ['premium', 'saltwater', 'reels'] },
  { id: 'fi003', sku: 'RAPALA-LURES', name: "Rapala X-Rap Slashbait Lure Pack", category: 'fishing', subcategory: 'lures', price: 24.99, brand: 'Rapala', rating: 4.6, reviews: 432, image: '🎣', photo: 'https://images.unsplash.com/photo-1571438213099-30293c073cdb?w=600&fit=crop&q=80', photos: ['https://images.unsplash.com/photo-1571438213099-30293c073cdb?w=800&q=80', 'https://images.unsplash.com/photo-1485451187253-ba80d54f1e62?w=800&q=80', 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80', 'https://images.unsplash.com/photo-1611089564888-3eedbb4f088c?w=800&q=80'], tags: ['lures'] },
  { id: 'fi004', sku: 'PLANO-TACKLE-BOX', name: "Plano 3700 Tackle Box", category: 'fishing', subcategory: 'accessories', price: 14.99, brand: 'Plano', rating: 4.7, reviews: 1234, image: '🧰', photo: 'https://images.unsplash.com/photo-1485451187253-ba80d54f1e62?w=600&fit=crop&q=80', photos: ['https://images.unsplash.com/photo-1485451187253-ba80d54f1e62?w=800&q=80', 'https://images.unsplash.com/photo-1571438213099-30293c073cdb?w=800&q=80', 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80', 'https://images.unsplash.com/photo-1611089564888-3eedbb4f088c?w=800&q=80'], tags: ['accessories'] },
  { id: 'fi005', sku: 'BERKLEY-FIRELINE', name: "Berkley FireLine Braided Line 300yd", category: 'fishing', subcategory: 'accessories', price: 24.99, brand: 'Berkley', rating: 4.7, reviews: 823, image: '🧵', photo: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600&fit=crop&q=80', photos: ['https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80', 'https://images.unsplash.com/photo-1545056453-f0359c3df6db?w=800&q=80', 'https://images.unsplash.com/photo-1485451187253-ba80d54f1e62?w=800&q=80', 'https://images.unsplash.com/photo-1611089564888-3eedbb4f088c?w=800&q=80'], tags: ['accessories'] },
  { id: 'fi006', sku: 'PERCEPTION-KAYAK', name: "Perception Pescador Pro 10 Kayak", category: 'fishing', subcategory: 'watercraft', price: 799.99, brand: 'Perception', rating: 4.6, reviews: 156, image: '🛶', photo: 'https://images.unsplash.com/photo-1604537466573-5e94508fd388?w=600&fit=crop&q=80', photos: ['https://images.unsplash.com/photo-1604537466573-5e94508fd388?w=800&q=80', 'https://images.unsplash.com/photo-1623509789543-d8da40b6f23a?w=800&q=80', 'https://images.unsplash.com/photo-1523398002811-999ca8dec234?w=800&q=80', 'https://images.unsplash.com/photo-1611089564888-3eedbb4f088c?w=800&q=80'], tags: ['premium', 'watercraft'] },
  { id: 'fi007', sku: 'FROGG-TOGGS-WADERS', name: "Frogg Toggs Hellbender Neoprene Waders", category: 'fishing', subcategory: 'apparel', price: 149.99, brand: 'Frogg Toggs', rating: 4.4, reviews: 234, image: '👖', photo: 'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=600&fit=crop&q=80', photos: ['https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=800&q=80', 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80', 'https://images.unsplash.com/photo-1523398002811-999ca8dec234?w=800&q=80', 'https://images.unsplash.com/photo-1611089564888-3eedbb4f088c?w=800&q=80'], tags: ['cold-weather', 'apparel'] },
  { id: 'fi008', sku: 'ENGEL-BAIT-COOLER', name: "Engel 30 Live Bait Cooler", category: 'fishing', subcategory: 'accessories', price: 89.99, brand: 'Engel', rating: 4.6, reviews: 167, image: '🧊', photo: 'https://images.unsplash.com/photo-1620656798932-902a8a9f5f96?w=600&fit=crop&q=80', photos: ['https://images.unsplash.com/photo-1620656798932-902a8a9f5f96?w=800&q=80', 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=800&q=80', 'https://images.unsplash.com/photo-1523398002811-999ca8dec234?w=800&q=80', 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80'], tags: ['accessories'] },
  { id: 'fi009', sku: 'GLOOMIS-FW-ROD', name: "G. Loomis GLX 7ft Freshwater Rod", category: 'fishing', subcategory: 'rods', price: 449.99, brand: 'G. Loomis', rating: 4.9, reviews: 89, image: '🎣', photo: 'https://images.unsplash.com/photo-1611089564888-3eedbb4f088c?w=600&fit=crop&q=80', photos: ['https://images.unsplash.com/photo-1611089564888-3eedbb4f088c?w=800&q=80', 'https://images.unsplash.com/photo-1545580017-fa4c01292e1c?w=800&q=80', 'https://images.unsplash.com/photo-1523398002811-999ca8dec234?w=800&q=80', 'https://images.unsplash.com/photo-1545056453-f0359c3df6db?w=800&q=80'], tags: ['premium', 'rods'] },
  { id: 'fi010', sku: 'FRABILL-LANDING-NET', name: "Frabill Folding Landing Net", category: 'fishing', subcategory: 'accessories', price: 34.99, brand: 'Frabill', rating: 4.5, reviews: 318, image: '🥅', photo: 'https://images.unsplash.com/photo-1485451187253-ba80d54f1e62?w=600&fit=crop&q=80', photos: ['https://images.unsplash.com/photo-1485451187253-ba80d54f1e62?w=800&q=80', 'https://images.unsplash.com/photo-1571438213099-30293c073cdb?w=800&q=80', 'https://images.unsplash.com/photo-1611089564888-3eedbb4f088c?w=800&q=80', 'https://images.unsplash.com/photo-1523398002811-999ca8dec234?w=800&q=80'], tags: ['accessories'] },
  { id: 'fi011', sku: 'HUMMINBIRD-HELIX-5', name: "Humminbird Helix 5 Fish Finder", category: 'fishing', subcategory: 'electronics', price: 329.99, brand: 'Humminbird', rating: 4.7, reviews: 198, image: '📡', photo: 'https://images.unsplash.com/photo-1606639386377-7eb78f9b0571?w=600&fit=crop&q=80', photos: ['https://images.unsplash.com/photo-1606639386377-7eb78f9b0571?w=800&q=80', 'https://images.unsplash.com/photo-1604537466573-5e94508fd388?w=800&q=80', 'https://images.unsplash.com/photo-1523398002811-999ca8dec234?w=800&q=80', 'https://images.unsplash.com/photo-1611089564888-3eedbb4f088c?w=800&q=80'], tags: ['premium', 'electronics'] },
  { id: 'fi012', sku: 'SHIMANO-STRADIC-REEL', name: "Shimano Stradic FL Spinning Reel 3000", category: 'fishing', subcategory: 'reels', price: 229.99, brand: 'Shimano', rating: 4.9, reviews: 342, image: '🎣', photo: 'https://images.unsplash.com/photo-1545056453-f0359c3df6db?w=600&fit=crop&q=80', photos: ['https://images.unsplash.com/photo-1545056453-f0359c3df6db?w=800&q=80', 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80', 'https://images.unsplash.com/photo-1485451187253-ba80d54f1e62?w=800&q=80', 'https://images.unsplash.com/photo-1611089564888-3eedbb4f088c?w=800&q=80'], tags: ['premium', 'reels'] },
];

// ---- Adapter Interface (commercetools-shaped) ------------------------------
class CommerceAdapter {
  async getProduct(id) { throw new Error('not implemented'); }
  async getProducts(filter) { throw new Error('not implemented'); }
  async getCategory(slug) { throw new Error('not implemented'); }
  async search(query, opts) { throw new Error('not implemented'); }
  async visualSearch(imageData) { throw new Error('not implemented'); }
  async addToCart(items) { throw new Error('not implemented'); }
  async getMerchandisingRules() { throw new Error('not implemented'); }
  async updateMerchandisingRule(id, payload) { throw new Error('not implemented'); }
  // Customer accounts (live only on Shopify). Safe no-op defaults so the
  // storefront's persona login / order history degrade gracefully on Mock.
  async customerLogin(email, password) { return { success: true, token: `local-${email}`, stub: true }; }
  async getCustomer(token) { return null; }
  async getCustomerOrders(token) { return []; }
  async getLocations() { return []; }
  async getInventoryByLocation(id) { return null; }
}

// ---- Mock Adapter (drop-in stand-in for live backend) -----------------------
class MockAdapter extends CommerceAdapter {
  constructor() {
    super();
    this.rules = {
      'home-hero': {
        hunter: 'Pre-Season Ready. Built for the Hunt.',
        parent: 'Game Day Starts Here.',
        fitness: 'Move Better. Save More.',
        guest: 'Sport, Outdoors, All Year Round.',
      },
      'category-banner-hunting': { hunter: 'Deer Season Essentials', parent: 'Outdoor Family Gear', fitness: 'Performance Outdoor' },
      'pdp-module': {
        hunter:  { title: 'Pairs With Your Blind Setup',          items: ['h002', 'h006', 'h008'] },
        parent:  { title: 'Team Bundle Savings — Save $18',       items: ['t002', 't003', 't004'] },
        fitness: { title: 'Built For Your Stride',                items: ['f002', 'f003', 'f005'] },
        guest:   { title: 'Featured for All Shoppers',            items: ['h001', 't001', 'f001'] },
      },
      pinned: {},
    };
  }
  async getProduct(id) {
    await this._latency();
    return CATALOG.find(p => p.id === id);
  }
  async getProducts(filter = {}) {
    await this._latency();
    let results = CATALOG;
    if (filter.category) results = results.filter(p => p.category === filter.category);
    if (filter.subcategory) results = results.filter(p => p.subcategory === filter.subcategory);
    if (filter.tags) results = results.filter(p => filter.tags.some(t => p.tags?.includes(t)));
    return results;
  }
  async getCategory(slug) {
    await this._latency();
    return { slug, name: slug.replace('-', ' '), facets: this._facetsFor(slug) };
  }
  async search(query, opts = {}) {
    await this._latency(600);
    // Mock semantic search keyed off three locked stage queries
    const q = query.toLowerCase();
    if (q.includes('crossbow') && q.includes('beginner')) {
      return {
        results: [
          { product: CATALOG.find(p => p.id === 'h004'), reason: 'Beginner-friendly crossbow under $400 with high reviews from first-time hunters.' },
          { product: CATALOG.find(p => p.id === 'h003'), reason: 'Slightly above budget but worth noting — Ravin\'s most-recommended starter platform.' },
        ],
      };
    }
    if (q.includes('running') && (q.includes('flat') || q.includes('stability') || q.includes('overpronation'))) {
      return {
        results: [
          { product: CATALOG.find(p => p.id === 'f002'), reason: 'Maximum stability and support — gold standard for flat feet and overpronation.' },
          { product: CATALOG.find(p => p.id === 'f003'), reason: 'Lighter stability option with J-Frame support, great for daily training on flat arches.' },
        ],
      };
    }
    if (q.includes('youth') && q.includes('soccer') && (q.includes('size 4') || q.includes('firm'))) {
      return {
        results: [
          { product: CATALOG.find(p => p.id === 't001'), reason: 'Youth size 4, firm-ground studs — matches all three criteria exactly.' },
          { product: CATALOG.find(p => p.id === 't002'), reason: 'Pairs with the cleats — official MLS match ball in size 4.' },
        ],
      };
    }
    // Generic fallback
    const tokens = q.split(/\s+/).filter(Boolean);
    const scored = CATALOG.map(p => {
      const hay = `${p.name} ${p.brand} ${p.category} ${(p.tags || []).join(' ')}`.toLowerCase();
      const score = tokens.reduce((s, t) => s + (hay.includes(t) ? 1 : 0), 0);
      return { product: p, score };
    }).filter(x => x.score > 0).sort((a, b) => b.score - a.score).slice(0, 4);
    return { results: scored.map(s => ({ product: s.product, reason: `Matches: ${tokens.filter(t => `${s.product.name} ${s.product.brand}`.toLowerCase().includes(t)).join(', ')}` })) };
  }
  async visualSearch(imageMeta) {
    await this._latency(900);
    // Mock: returns top 5 visually similar based on declared "image type"
    const map = {
      jersey:  ['t013', 'f005', 't001', 'f013', 'h005'],
      shoe:    ['f001', 'f002', 'f003', 'f007', 'f008'],
      lure:    ['fi003', 'fi002', 'fi001', 'fi005', 'fi009'],
      scope:   ['h001', 'h009', 'h015', 'h003', 'h010'],
      jacket:  ['h005', 'fi007', 'f005', 't013', 'f014'],
      ball:    ['t002', 't009', 't011', 't014', 't008'],
      cooler:  ['c004', 'c009', 'fi008', 'c011', 'c005'],
      tent:    ['c001', 'c006', 'c012', 'c003', 'h002'],
      default: ['f001', 't001', 'h001', 'c001', 'c004'],
    };
    const ids = map[imageMeta?.type] || map.default;
    return ids.map(id => CATALOG.find(p => p.id === id)).filter(Boolean);
  }
  async addToCart(items) {
    await this._latency();
    return { success: true, lineItems: items, total: items.reduce((s, i) => s + (i.product.price * i.qty), 0) };
  }
  async getMerchandisingRules() {
    return this.rules;
  }
  async updateMerchandisingRule(id, payload) {
    await this._latency();
    this.rules[id] = payload;
    return { success: true };
  }
  _facetsFor(slug) {
    if (slug === 'hunting') return [
      { id: 'subcategory', name: 'Type', values: ['Optics', 'Blinds', 'Crossbows', 'Firearms', 'Ammunition', 'Apparel', 'Calls', 'Footwear', 'Stands', 'Tools'] },
      { id: 'brand', name: 'Brand', values: ['Vortex', 'Ameristep', 'Ravin', 'Barnett', 'Realtree', 'Primos', 'Muck', 'Millennium', 'Ruger', 'Federal', 'Buck', 'Streamlight', 'Reconyx'] },
      { id: 'price', name: 'Price', values: ['Under $50', '$50–$200', '$200–$500', 'Over $500'] },
      { id: 'season', name: 'Season', values: ['Deer', 'Turkey', 'Waterfowl', 'Small Game'] },
    ];
    return [];
  }
  _latency(ms = 250) { return new Promise(r => setTimeout(r, ms + Math.random() * 100)); }
}

/* ----------------------------------------------------------------------------
   CommercetoolsAdapter
   Shaped against the commercetools HTTP API: OAuth client-credentials auth,
   ProductProjection responses with masterVariant + localized name/description,
   prices as { centAmount, currencyCode, fractionDigits }, attribute arrays.

   Runs in two modes:
   - LIVE: config has authUrl + apiUrl + clientId + clientSecret + projectKey
     → real HTTP calls fire (OAuth, then product-projections/search, etc).
   - STUB: no creds configured → uses the same demo catalog but pipes everything
     through commercetools-shaped data structures so the contract is real.

   Both modes return the SAME UI-shape as MockAdapter, so the storefront
   doesn't know the difference. The mapping from commercetools shapes to
   UI-shape happens in _project*() methods at the boundary.
   ---------------------------------------------------------------------------- */

/* ============================================================================
   LLM CONFIG — Powers the AI assistant
   Two transport modes (proxy is strongly preferred for any public deploy):

   1. PROXY MODE (recommended for public URLs):
      Set VITE_PROXY_URL to your Cloudflare Worker URL. The browser never sees
      a key — the Worker holds it server-side. Safe for public GitHub Pages.

   2. DIRECT MODE (laptop dev only — exposes key in browser):
      Set VITE_ANTHROPIC_KEY in .env.local. Browser calls Anthropic directly.
      Anthropic may revoke any key it detects in a browser, so don't deploy this.

   3. SCRIPTED FALLBACK (no config required):
      With neither set, chat uses keyword-matched canned responses. Always works.
   ============================================================================ */
const _readPersistedKey = () => {
  try {
    return typeof window !== 'undefined' ? (window.localStorage.getItem('aso_anthropic_key') || '') : '';
  } catch (e) { return ''; }
};
const _envProxy = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_PROXY_URL) || '';
const _envKey = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_ANTHROPIC_KEY) || '';
const _initialKey = _envKey || _readPersistedKey();

let LLM_CONFIG = {
  provider: 'anthropic',
  // Recommended model as of 2026: Sonnet 4.6 — Opus-level intelligence at Sonnet pricing,
  // strong vision support, and current generation. For maximum capability use 'claude-opus-4-7'.
  // Previously this was 'claude-3-5-sonnet-20241022' which was retired Jan 2026.
  model: 'claude-sonnet-4-6',
  proxyUrl: _envProxy,              // e.g. https://aso-demo-proxy.account.workers.dev
  apiKey: _initialKey,              // only used in DIRECT mode (no proxy)
  enabled: Boolean(_envProxy || _initialKey),
  source: _envProxy ? 'proxy' : (_envKey ? 'env' : (_initialKey ? 'localStorage' : 'none')),
};

// Catalog summary the LLM uses to ground its picks
// Adapter-aware catalog snapshot for LLM prompts. Async because Shopify needs a network call,
// but cached in memory after first fetch per adapter to keep prompt building fast.
let _catalogContextCache = null;
let _catalogContextAdapterId = null;

const buildCatalogContext = async () => {
  // If we already cached this adapter's catalog, reuse it
  const currentAdapterId = adapter?.constructor?.name || 'unknown';
  if (_catalogContextCache && _catalogContextAdapterId === currentAdapterId) {
    return _catalogContextCache;
  }
  try {
    // Try fetching from the live adapter
    const products = adapter._allProducts ? await adapter._allProducts() :
                     adapter.getProducts ? await adapter.getProducts({}) :
                     CATALOG;
    const trimmed = (products || CATALOG).map(p => ({
      id: p.id, sku: p.sku, name: p.name, brand: p.brand,
      category: p.category, subcategory: p.subcategory,
      price: p.price, compareAt: p.compareAt, rating: p.rating, tags: p.tags || [],
    }));
    _catalogContextCache = trimmed;
    _catalogContextAdapterId = currentAdapterId;
    return trimmed;
  } catch (e) {
    // Fall back to hardcoded mock catalog if adapter fails
    return CATALOG.map(p => ({
      id: p.id, sku: p.sku, name: p.name, brand: p.brand,
      category: p.category, subcategory: p.subcategory,
      price: p.price, compareAt: p.compareAt, rating: p.rating, tags: p.tags || [],
    }));
  }
};

// Sync version for places that can't await (e.g. embedded in system prompt template strings)
const buildCatalogContextSync = () => {
  if (_catalogContextCache) return _catalogContextCache;
  return CATALOG.map(p => ({
    id: p.id, sku: p.sku, name: p.name, brand: p.brand,
    category: p.category, subcategory: p.subcategory,
    price: p.price, compareAt: p.compareAt, rating: p.rating, tags: p.tags || [],
  }));
};

// Invalidate the cache when the adapter is swapped
const invalidateCatalogContext = () => {
  _catalogContextCache = null;
  _catalogContextAdapterId = null;
};

// System prompt — teaches the LLM about the storefront, schema, and actions
const buildSystemPrompt = (state) => `You are the AI shopping assistant for Academy Sports + Outdoors, a real US sporting goods retailer.

You are powered by an A2UI (Agent-to-UI) interface — you can BOTH chat AND drive the storefront. Your responses control the actual page the customer sees. You are a confident, action-oriented assistant: when the user asks you to do something the actions allow, DO IT — don't say "you'll need to do that yourself."

Current customer persona: ${state.persona} (${PERSONAS[state.persona]?.name})
Current page: ${state.view}
Cart items: ${state.cart.length}${state.cart.length > 0 ? `:
${state.cart.map(c => `  - "${c.product?.name || c.product?.title || 'item'}" (id: ${c.product?.id})${c.qty > 1 ? ` ×${c.qty}` : ''}`).join('\n')}
When the user refers to a cart item by description (e.g. "the scope", "the running shoes"), match it to the right product ID above and use that exact id for removeFromCart.` : ''}
${state.purchaseHistory && state.purchaseHistory.length > 0 ? `
=== THIS CUSTOMER'S REAL PURCHASE HISTORY (from Shopify) ===
These are ${PERSONAS[state.persona]?.name}'s actual past orders, pulled live from the store. Ground your recommendations in what they've genuinely bought — reference specific past purchases when it's natural ("Since you picked up the ${state.purchaseHistory[0]?.items?.[0]?.title || 'gear'} a while back…"). Suggest complementary items, refills, upgrades, or the next logical purchase given this history. Do NOT recommend something they already own unless it's a consumable refill.
${state.purchaseHistory.map(o => `- ${o.daysAgo != null ? o.daysAgo + ' days ago' : 'recently'}: ${o.items.map(i => i.title + (i.quantity > 1 ? ` ×${i.quantity}` : '')).join(', ')} ($${o.total.toFixed(2)})`).join('\n')}
` : ''}

=== PERSONA NAMES (IMPORTANT) ===
Personas have both technical keys (used in the setPersona action) and human display names that users will say:
- Key "hunter" = "Jake" — hunting/Texas/deer-season shopper
- Key "parent" = "Maria" — youth/team-sports/soccer-mom shopper
- Key "fitness" = "Alex" — fitness/deal-led/running shopper

If the user says "switch to Jake" or "show me Maria's home", silently translate the name to the key and use setPersona with the key value. Never tell the user "I don't recognize that persona" — always translate.

=== PERSONA SHOPPING PREFERENCES (use this when picking products for showResults) ===
Each persona has a distinct shopping bias. When you select products for a showResults action, weight your picks toward what THIS persona would actually choose, even when they're browsing outside their primary category. The full category page sorts the same way — your highlights should agree with that sort so the chat and page tell one coherent story.

- "hunter" (Jake) — values PREMIUM, PROVEN, DURABLE. Prefers higher-priced items with strong ratings and reputation brands (Vortex, YETI, Ravin, Garmin). Sort priority: tagged "premium" first, then by price descending. Avoid leading with cheap entry-level items — Jake reads those as "not serious." When showing fitness, he wants Peloton/NordicTrack/Garmin, not the cheapest running shoe.
- "parent" (Maria) — values VALUE, SAFETY, YOUTH-APPROPRIATE. Prefers mid-priced items, youth sizing where relevant, bundle deals. Sort priority: by price ascending, but prefer items tagged "youth" or "beginner" when category supports it. Avoid leading with the most premium item — Maria reads luxury picks as "wasteful for kids who'll outgrow them." When showing fitness, she wants family/value picks, not pro-grade equipment.
- "fitness" (Alex) — values DEALS, MARKDOWNS, SAVINGS. Prefers items with a compareAt price (sale items), tagged "deal" or "value". Sort priority: by discount depth (compareAt - price). Avoid leading with full-price premium items — Alex reads those as "no incentive to buy now." When showing hunting, she wants the most discounted gear, not the top-end scope.

For an anonymous user (no persona), pick by general top-rated quality across the requested category — no persona weighting.

When you mix categories or face ambiguity, the persona preference is the tiebreaker.

=== AVAILABLE ACTIONS ===
Return as JSON array under "actions". You can include multiple in sequence.

Navigation:
- { "type": "navigate", "view": "home" }            — go to home
- { "type": "navigate", "view": "category" }        — go to category browsing page
- { "type": "navigate", "view": "kit" }             — open Kit Builder agent
- { "type": "navigate", "view": "merch" }           — open Merchandiser admin tool
- { "type": "navigate", "view": "cart" }            — alias: viewCart

Product display:
- { "type": "showResults", "ids": ["h001", "h003"], "reasons": ["matches budget", "top-rated"] }
                                                    — display 2-5 product cards inline in chat
- { "type": "openProduct", "id": "h001" }           — open a specific PDP page

Filtering:
- { "type": "applyFilter", "facetId": "category", "value": "hunting" | "team-sports" | "fitness" | "camping" | "fishing" }
- { "type": "applyFilter", "facetId": "brand", "value": "Vortex" | "Nike" | "YETI" | ... }
- { "type": "applyFilter", "facetId": "tag", "value": "premium" | "value" | "youth" | "deal" | ... }

Cart actions:
- { "type": "addToCart", "id": "h001", "qty": 1 }
- { "type": "removeFromCart", "id": "h001" }        — remove specific product from cart
- { "type": "clearCart" }                            — empty the entire cart
- { "type": "viewCart" }                             — show cart page
- { "type": "checkout" }                             — place order and clear cart

Personalization:
- { "type": "setPersona", "persona": "hunter" | "parent" | "fitness" } — switches the persona

=== CATEGORIES & TAGS ===
The catalog has 5 top-level categories:
- "hunting" — scopes, blinds, crossbows, firearms, ammo, knives, optics, camo apparel
- "team-sports" — soccer cleats, balls, jerseys, baseball gear, basketballs, training cones
- "fitness" — running shoes, dumbbells, yoga mats, treadmills, apparel, GPS watches
- "camping" — tents, sleeping bags, coolers, stoves, lanterns, backpacking gear
- "fishing" — rods, reels, lures, kayaks, tackle, fish finders

Common tags: premium, value, beginner, deal, youth, footwear, optics, crossbows, accessories, cold-weather, camo, soccer, baseball, basketball, neutral, stability, home-gym, watercraft.

=== CATALOG ===
${JSON.stringify(buildCatalogContextSync())}

=== RULES ===
1. RESPOND WITH ONLY A SINGLE JSON OBJECT. No markdown code fences. No preamble. No commentary outside the JSON. The first character MUST be { and the last MUST be }.
2. The JSON shape: { "message": "natural reply", "actions": [...] }
3. When the user asks to find/recommend products, return showResults with 2-5 products and short reasons (under 12 words each).
4. When the user wants a different category ("show me fitness", "what about camping gear", "load hunting"), return BOTH a showResults action AND an applyFilter category action. The showResults provides 2-3 highlight picks for that category that appear in chat; the applyFilter navigates the storefront to the full category page. Pick IDs from the requested category in the catalog above. Example: user says "show me fitness products" → { "actions": [ { "type": "showResults", "ids": ["f001","f002","f005"], "reasons": [...] }, { "type": "applyFilter", "facetId": "category", "value": "fitness" } ] }. NEVER say "here are some picks" in the message without including a showResults action — the user will see no products and feel misled.
5. When user asks "open", "show me", "look at" a SPECIFIC product → openProduct.
6. When user says "add to cart", "buy", "I'll take it" → addToCart.
7. When user says "clear my cart", "empty my cart", "remove everything" → clearCart. CONFIRM in your message.
8. When user says "remove X from cart", "take the scope out" → removeFromCart with the matching product ID (look at the cart IDs above).
9. When user says "checkout", "place my order", "I'm ready" → checkout. The system will clear the cart automatically after placing.
10. When user asks to navigate ("take me to kit builder", "show me the merch tool", "open my cart") → navigate to that view.
11. Keep "message" concise — 1-2 sentences. Product cards and page changes do the talking.
12. For multi-step requests ("find me a scope and add it to cart"), return BOTH actions in sequence.
13. Never make up products. Only use IDs from the catalog above.
14. Be confident and action-oriented. If an action exists for what the user asks, USE IT. Never tell them to "do it manually" if you have an action that does it.
15. ALWAYS weight showResults picks by the active persona's preferences (see PERSONA SHOPPING PREFERENCES above). The category page sorts the same way — your chat picks should agree with it, not contradict it. For hunter, lead with premium/proven brands. For parent, lead with value/youth/safe picks. For fitness, lead with discounted/deal items. For anonymous (no persona), lead with top-rated.`;

const FALLBACK_SCRIPTS = {
  // Keyword → scripted response (used when no API key)
  'crossbow': { message: "Found a few crossbows. Here are my picks based on your budget.", actions: [{ type: 'showResults', ids: ['h004', 'h003'], reasons: ["Great value pick under $400 — Barnett is a trusted entry brand", "Premium option if budget is flexible — Ravin's the gold standard"] }] },
  'running shoe': { message: "For runners with flat feet, stability is the priority. Two top picks:", actions: [{ type: 'showResults', ids: ['f002', 'f003'], reasons: ["ASICS Kayano 30 — known stability platform, ideal for overpronation", "Hoka Arahi 7 — lighter alternative with similar support"] }] },
  'flat feet': { message: "For runners with flat feet, stability is the priority. Two top picks:", actions: [{ type: 'showResults', ids: ['f002', 'f003'], reasons: ["ASICS Kayano 30 — known stability platform, ideal for overpronation", "Hoka Arahi 7 — lighter alternative with similar support"] }] },
  'soccer cleat': { message: "Here's the right setup for a youth firm-ground player:", actions: [{ type: 'showResults', ids: ['t001', 't002', 't003'], reasons: ["Nike Phantom Jr. — youth firm-ground, great for grass fields", "Adidas MLS Match Ball Size 4 — correct size for U10-U12", "Nike Charge youth shin guards — entry-level, durable"] }] },
  'youth soccer': { message: "Here's the right setup for a youth firm-ground player:", actions: [{ type: 'showResults', ids: ['t001', 't002', 't003'], reasons: ["Nike Phantom Jr. — youth firm-ground, great for grass fields", "Adidas MLS Match Ball Size 4 — correct size for U10-U12", "Nike Charge youth shin guards — entry-level, durable"] }] },
  'scope': { message: "Here are top scopes for deer hunting:", actions: [{ type: 'showResults', ids: ['h001', 'h009'], reasons: ["Vortex Diamondback 4-16x44 — pro-staff favorite, lifetime warranty", "Vortex Crossfire HD 10x42 binos — pair with the scope for full glass setup"] }] },
  'kayak': { message: "Here's a popular fishing kayak under $1000:", actions: [{ type: 'showResults', ids: ['fi006'], reasons: ["Perception Pescador Pro 10 — sit-on-top fishing kayak, stable and tracking-friendly"] }] },
  'fishing': { message: "Here are my top fishing picks across rods, reels, and accessories:", actions: [{ type: 'showResults', ids: ['fi001', 'fi002', 'fi003'], reasons: ["Ugly Stik GX2 — most durable beginner rod we sell", "Penn Battle III — premium saltwater spinning reel", "Rapala X-Rap — proven lure for bass and pike"] }] },
  'rod': { message: "Two solid rod choices depending on your budget:", actions: [{ type: 'showResults', ids: ['fi001', 'fi009'], reasons: ["Shakespeare Ugly Stik GX2 — best entry-level value, near-unbreakable", "G. Loomis GLX 7' — premium freshwater rod for serious anglers"] }] },
  'cooler': { message: "Coolers ranked by size — both YETI:", actions: [{ type: 'showResults', ids: ['c004', 'c009'], reasons: ["YETI Tundra 45 — 3-4 day capacity, holds ice in beach heat", "YETI Roadie 24 — compact, perfect for day trips"] }] },
  'binocular': { message: "For deer hunting glassing:", actions: [{ type: 'showResults', ids: ['h009'], reasons: ["Vortex Crossfire HD 10x42 — best value binos under $200, lifetime warranty"] }] },
  'firearm': { message: "Here's our top-rated rifle for general hunting and target use:", actions: [{ type: 'showResults', ids: ['h010'], reasons: ["Ruger AR-556 — reliable, versatile, customer favorite"] }] },
  'rifle': { message: "Here's our top-rated rifle:", actions: [{ type: 'showResults', ids: ['h010'], reasons: ["Ruger AR-556 — reliable, versatile, well-reviewed"] }] },
  'baseball': { message: "Here's a complete youth baseball setup:", actions: [{ type: 'showResults', ids: ['t007', 't008'], reasons: ["Easton ADV 360 USA bat — top-rated for Little League", "Rawlings Playmaker 11\" glove — sized for ages 9-12"] }] },
  'basketball': { message: "Indoor basketball + a hoop:", actions: [{ type: 'showResults', ids: ['t009', 't010'], reasons: ["Spalding NBA indoor ball — official feel", "Lifetime 54\" portable hoop — driveway-ready"] }] },
  'treadmill': { message: "Here's our top deal on a home treadmill:", actions: [{ type: 'showResults', ids: ['f012'], reasons: ["NordicTrack T 6.5 S — incline, app integration, under $1000 on sale"] }] },
  'home gym': { message: "Three foundational pieces for a starter home gym:", actions: [{ type: 'showResults', ids: ['f004', 'f010', 'f011'], reasons: ["CAP dumbbell set 5-25lb — covers most lift ranges", "CAP 35lb kettlebell — for swings and goblet squats", "Weider adjustable bench — flat, incline, decline"] }] },
  'yoga': { message: "Yoga mat + complementary apparel:", actions: [{ type: 'showResults', ids: ['f006', 'f014'], reasons: ["Manduka Pro 6mm — industry-standard premium mat", "Lululemon Align leggings — perfect for low-impact flow"] }] },
  'watch': { message: "Best GPS running watch we carry:", actions: [{ type: 'showResults', ids: ['f015'], reasons: ["Garmin Forerunner 265 — full GPS tracking, marathon-grade battery"] }] },
  'jacket': { message: "Two warm jacket picks depending on conditions:", actions: [{ type: 'showResults', ids: ['h005', 'fi007'], reasons: ["Realtree Edge insulated — best for cold deer-season stands", "Frogg Toggs neoprene waders — for fishing in cold water"] }] },
  'boot': { message: "Here are our top-rated outdoor boots:", actions: [{ type: 'showResults', ids: ['h007'], reasons: ["Muck Wetland Camo — waterproof, insulated, hunter favorite"] }] },
  'hunting': { message: "Showing the hunting category — I'll prioritize what's right for deer season.", actions: [{ type: 'navigate', view: 'category' }] },
  'cart': { message: "Taking you to your cart.", actions: [{ type: 'viewCart' }] },
  'checkout': { message: "Starting checkout.", actions: [{ type: 'checkout' }] },
  'home': { message: "Heading home.", actions: [{ type: 'navigate', view: 'home' }] },
  'kit': { message: "Opening the AI Kit Builder — describe your scenario and I'll assemble the gear.", actions: [{ type: 'navigate', view: 'kit' }] },
};

// Tokens that hint at a broad category but aren't in scripted keywords above —
// fall through to a smart catalog search so single-word queries always return something.
const SMART_KEYWORDS = {
  'shoe':       { category: 'fitness', subcat: 'footwear', label: 'running shoes' },
  'shoes':      { category: 'fitness', subcat: 'footwear', label: 'running shoes' },
  'sneaker':    { category: 'fitness', subcat: 'footwear', label: 'running shoes' },
  'sneakers':   { category: 'fitness', subcat: 'footwear', label: 'running shoes' },
  'runner':     { category: 'fitness', subcat: 'footwear', label: 'running shoes' },
  'runners':    { category: 'fitness', subcat: 'footwear', label: 'running shoes' },
  'shirt':      { category: 'fitness', subcat: 'apparel',  label: 'shirts and apparel' },
  'shirts':     { category: 'fitness', subcat: 'apparel',  label: 'shirts and apparel' },
  'tee':        { category: 'fitness', subcat: 'apparel',  label: 'training tees' },
  'tees':       { category: 'fitness', subcat: 'apparel',  label: 'training tees' },
  'shorts':     { category: 'fitness', subcat: 'apparel',  label: 'training shorts' },
  'legging':    { category: 'fitness', subcat: 'apparel',  label: 'leggings' },
  'leggings':   { category: 'fitness', subcat: 'apparel',  label: 'leggings' },
  'pants':      { category: 'fitness', subcat: 'apparel',  label: 'training pants and leggings' },
  'dumbbell':   { category: 'fitness', subcat: 'weights',  label: 'dumbbells' },
  'dumbbells':  { category: 'fitness', subcat: 'weights',  label: 'dumbbells' },
  'kettlebell': { category: 'fitness', subcat: 'weights',  label: 'kettlebells' },
  'weight':     { category: 'fitness', subcat: 'weights',  label: 'weights' },
  'weights':    { category: 'fitness', subcat: 'weights',  label: 'weights' },
  'bike':       { category: 'fitness', subcat: 'equipment', label: 'exercise bikes' },
  'bench':      { category: 'fitness', subcat: 'equipment', label: 'weight benches' },
  'mat':        { category: 'fitness', subcat: 'accessories', label: 'yoga mats' },
  'mats':       { category: 'fitness', subcat: 'accessories', label: 'yoga mats' },
  'band':       { category: 'fitness', subcat: 'accessories', label: 'resistance bands' },
  'bands':      { category: 'fitness', subcat: 'accessories', label: 'resistance bands' },

  'tent':       { category: 'camping', subcat: 'shelter', label: 'tents' },
  'tents':      { category: 'camping', subcat: 'shelter', label: 'tents' },
  'sleeping':   { category: 'camping', subcat: 'sleep', label: 'sleeping bags and pads' },
  'lantern':    { category: 'camping', subcat: 'lighting', label: 'camping lanterns' },
  'cooler':     { category: 'camping', subcat: 'coolers', label: 'coolers' },
  'coolers':    { category: 'camping', subcat: 'coolers', label: 'coolers' },
  'stove':      { category: 'camping', subcat: 'cooking', label: 'camp stoves' },
  'backpack':   { category: 'camping', subcat: 'packs', label: 'backpacks' },
  'backpacks':  { category: 'camping', subcat: 'packs', label: 'backpacks' },
  'camping':    { category: 'camping', label: 'camping gear' },

  'optic':      { category: 'hunting', subcat: 'optics', label: 'optics' },
  'optics':     { category: 'hunting', subcat: 'optics', label: 'optics' },
  'scope':      { category: 'hunting', subcat: 'optics', label: 'scopes' },
  'scopes':     { category: 'hunting', subcat: 'optics', label: 'scopes' },
  'binocular':  { category: 'hunting', subcat: 'optics', label: 'binoculars' },
  'binoculars': { category: 'hunting', subcat: 'optics', label: 'binoculars' },
  'blind':      { category: 'hunting', subcat: 'blinds', label: 'hunting blinds' },
  'blinds':     { category: 'hunting', subcat: 'blinds', label: 'hunting blinds' },
  'crossbow':   { category: 'hunting', subcat: 'crossbows', label: 'crossbows' },
  'crossbows':  { category: 'hunting', subcat: 'crossbows', label: 'crossbows' },
  'camo':       { category: 'hunting', subcat: 'apparel', label: 'camo apparel' },
  'knife':      { category: 'hunting', subcat: 'tools', label: 'knives' },
  'knives':     { category: 'hunting', subcat: 'tools', label: 'knives' },
  'light':      { category: 'hunting', subcat: 'tools', label: 'tactical lights' },
  'flashlight': { category: 'hunting', subcat: 'tools', label: 'tactical lights' },
  'boot':       { category: 'hunting', subcat: 'footwear', label: 'outdoor boots' },
  'boots':      { category: 'hunting', subcat: 'footwear', label: 'outdoor boots' },

  'rod':        { category: 'fishing', subcat: 'rods', label: 'fishing rods' },
  'rods':       { category: 'fishing', subcat: 'rods', label: 'fishing rods' },
  'reel':       { category: 'fishing', subcat: 'reels', label: 'fishing reels' },
  'reels':      { category: 'fishing', subcat: 'reels', label: 'fishing reels' },
  'lure':       { category: 'fishing', subcat: 'lures', label: 'fishing lures' },
  'lures':      { category: 'fishing', subcat: 'lures', label: 'fishing lures' },
  'tackle':     { category: 'fishing', label: 'tackle boxes and gear' },
  'fish':       { category: 'fishing', label: 'fishing gear' },
  'fishing':    { category: 'fishing', label: 'fishing gear' },
  'kayak':      { category: 'fishing', subcat: 'watercraft', label: 'kayaks' },
  'kayaks':     { category: 'fishing', subcat: 'watercraft', label: 'kayaks' },
  'wader':      { category: 'fishing', subcat: 'apparel', label: 'waders' },
  'waders':     { category: 'fishing', subcat: 'apparel', label: 'waders' },

  'ball':       { category: 'team-sports', label: 'sports balls' },
  'balls':      { category: 'team-sports', label: 'sports balls' },
  'cleat':      { category: 'team-sports', subcat: 'soccer', label: 'soccer cleats' },
  'cleats':     { category: 'team-sports', subcat: 'soccer', label: 'soccer cleats' },
  'soccer':     { category: 'team-sports', subcat: 'soccer', label: 'soccer gear' },
  'football':   { category: 'team-sports', subcat: 'football', label: 'football gear' },
  'bat':        { category: 'team-sports', subcat: 'baseball', label: 'baseball bats' },
  'bats':       { category: 'team-sports', subcat: 'baseball', label: 'baseball bats' },
  'glove':      { category: 'team-sports', subcat: 'baseball', label: 'baseball gloves' },
  'gloves':     { category: 'team-sports', subcat: 'baseball', label: 'baseball gloves' },
  'hoop':       { category: 'team-sports', subcat: 'basketball', label: 'basketball hoops' },
  'jersey':     { category: 'team-sports', subcat: 'soccer', label: 'jerseys' },
  'jerseys':    { category: 'team-sports', subcat: 'soccer', label: 'jerseys' },
};

const smartSearch = (text) => {
  const lower = text.toLowerCase();
  // Try to find a matching smart keyword
  for (const [keyword, hint] of Object.entries(SMART_KEYWORDS)) {
    if (lower.includes(keyword)) {
      const matches = CATALOG.filter(p => {
        if (hint.category && p.category !== hint.category) return false;
        if (hint.subcat && p.subcategory !== hint.subcat) return false;
        return true;
      }).slice(0, 4);
      if (matches.length > 0) {
        return {
          message: `Here are top picks for ${hint.label}:`,
          actions: [{
            type: 'showResults',
            ids: matches.map(p => p.id),
            reasons: matches.map(p => `${p.brand} ${p.name.split(' ').slice(-2).join(' ')} — ${p.rating}★ (${p.reviews} reviews)`),
          }],
        };
      }
    }
  }
  return null;
};

const matchFallback = (text) => {
  const t = text.toLowerCase();
  for (const [key, response] of Object.entries(FALLBACK_SCRIPTS)) {
    if (t.includes(key)) return response;
  }
  return null;
};

// Robust JSON extraction from LLM text responses. Claude sometimes wraps JSON
// in markdown code fences (```json ... ```) and may add explanatory text
// before OR after the JSON. We find the first balanced {...} block and parse
// that, ignoring everything else.
const extractJsonFromLLM = (text) => {
  if (!text) return null;
  // Step 1: prefer content inside a markdown code fence if present
  let cleaned = text;
  const fenceMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) {
    cleaned = fenceMatch[1];
  }
  cleaned = cleaned.trim();
  // Step 2: find the first balanced {...} block (respecting strings and escapes)
  const firstBrace = cleaned.indexOf('{');
  if (firstBrace === -1) return null;
  let depth = 0;
  let inString = false;
  let escape = false;
  for (let i = firstBrace; i < cleaned.length; i++) {
    const ch = cleaned[i];
    if (escape) { escape = false; continue; }
    if (ch === '\\') { escape = true; continue; }
    if (ch === '"') { inString = !inString; continue; }
    if (inString) continue;
    if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) return cleaned.slice(firstBrace, i + 1);
    }
  }
  return null;
};

// Main LLM call — returns { message, actions[] }
async function callLLM(userText, state, conversationHistory = []) {
  // No config at all → use scripted fallback
  if (!LLM_CONFIG.enabled) {
    const fallback = matchFallback(userText);
    if (fallback) return fallback;
    const smart = smartSearch(userText);
    if (smart) return smart;
    // Generic no-match fallback: try search via adapter
    const res = await adapter.search(userText);
    if (res?.results?.length > 0) {
      return {
        message: `I found ${res.results.length} matches in our catalog:`,
        actions: [{ type: 'showResults', ids: res.results.map(r => r.product.id), reasons: res.results.map(r => r.reason) }],
      };
    }
    return {
      message: `I couldn't find a direct match for "${userText}". Try one of the suggestions below, or rephrase.`,
      actions: [],
    };
  }

  const messages = [
    ...conversationHistory.map(m => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: m.text,
    })),
    { role: 'user', content: userText },
  ];

  const payload = {
    model: LLM_CONFIG.model,
    max_tokens: 1024,
    system: buildSystemPrompt(state),
    messages,
  };

  // Pick transport: PROXY (preferred) or DIRECT (laptop only)
  const usingProxy = Boolean(LLM_CONFIG.proxyUrl);
  const url = usingProxy ? LLM_CONFIG.proxyUrl : 'https://api.anthropic.com/v1/messages';
  const headers = usingProxy
    ? { 'Content-Type': 'application/json' }
    : {
        'Content-Type': 'application/json',
        'x-api-key': LLM_CONFIG.apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      let errBody;
      try { errBody = await response.json(); } catch (e) { errBody = null; }
      console.warn('LLM call failed:', response.status, errBody);
      // Rate-limit message is human-friendly to show
      if (response.status === 429 && errBody?.error) {
        return { message: errBody.error, actions: [] };
      }
      // Fall back to scripts so the demo doesn't die
      const fb = matchFallback(userText);
      if (fb) return fb;
      const sm = smartSearch(userText);
      if (sm) return sm;
      return { message: "I had trouble reaching the AI. Try one of the suggestions below.", actions: [] };
    }

    const data = await response.json();
    const textBlock = data.content?.find(b => b.type === 'text');
    if (!textBlock) {
      return { message: "I couldn't formulate a response. Try rephrasing?", actions: [] };
    }

    // Robust JSON extraction — handles markdown fences and trailing commentary
    const jsonStr = extractJsonFromLLM(textBlock.text);
    if (jsonStr) {
      try {
        const parsed = JSON.parse(jsonStr);
        return {
          message: parsed.message || "Here's what I found:",
          actions: parsed.actions || [],
        };
      } catch (e) {
        // Extracted-but-still-invalid — fall through to plain text
      }
    }
    // LLM didn't return parseable JSON — treat text as plain message
    return { message: textBlock.text, actions: [] };
  } catch (err) {
    console.error('LLM call failed:', err);
    const fb = matchFallback(userText);
    if (fb) return fb;
    const sm = smartSearch(userText);
    if (sm) return sm;
    return { message: "I had trouble reaching the AI. Try again or use the suggestions below.", actions: [] };
  }
}

// ----- MERCH TOOL LLM CALL -------------------------------------------------
// Returns { message: string, suggestions: [{ kind, persona?, text?, skus?, label }] }
// Suggestion kinds: 'banner', 'pinSkus', 'unpinSkus', 'info'
async function callLLMForMerch(userText, currentRules, conversationHistory = []) {
  if (!LLM_CONFIG.enabled) return null;

  const catalog = await buildCatalogContext();
  const systemPrompt = `You are an AI merchandising assistant for Academy Sports + Outdoors. The admin running the storefront talks to you to draft hero banner copy, manage pinned SKUs, customize the PDP personalized module, and reason about merchandising decisions.

=== PERSONA NAMES (IMPORTANT) ===
The personas have both technical keys AND human names. Users will refer to them by name in conversation. ALWAYS translate names → keys silently, never ask for clarification:
- "Jake" / "Jake's" / "the hunter" / "hunting persona" → use persona key "hunter"
- "Maria" / "Maria's" / "the parent" / "soccer mom" / "youth shopper" → use persona key "parent"
- "Alex" / "Alex's" / "the fitness shopper" / "deal-led" → use persona key "fitness"
- "guest" / "guests" / "anonymous" / "unauthenticated" / "logged-out shoppers" → use persona key "guest"

When you talk back to the admin in your "message", you can refer to personas by either name (more natural) or key. But when you set "persona" in a suggestion, it MUST be "hunter", "parent", "fitness", or "guest" — those are the keys the system expects.

=== CATEGORIES ===
The storefront has 5 categories. Pinned SKUs are managed independently per category, so a deer-season pin for hunting won't pollute the fitness home page.
- "hunting" — scopes, blinds, crossbows, firearms, ammo, knives, optics, camo apparel
- "team-sports" — soccer cleats, balls, jerseys, baseball gear, basketballs, training cones
- "fitness" — running shoes, dumbbells, yoga mats, treadmills, apparel, GPS watches
- "camping" — tents, sleeping bags, coolers, stoves, lanterns, backpacking gear
- "fishing" — rods, reels, lures, kayaks, tackle, fish finders

When you suggest pinSkus, the system infers the category from each SKU's catalog entry. If multiple categories are mixed in one suggestion, they are routed to their respective category panels automatically. You can also include an explicit "category" field as a fallback for ambiguous cases.

=== PDP PERSONALIZED MODULE ===
Each product detail page has a "Personalized for X" section that appears below the buy box, per persona. It has a TITLE (short headline) and ITEMS (up to 3 product IDs or SKUs). Examples of current titles: "Pairs With Your Blind Setup" (hunter), "Team Bundle Savings" (parent), "Built For Your Stride" (fitness). The admin can ask you to change either field for any persona. Use the "pdpModule" suggestion kind. Provide title and/or items — either or both. Items can be product IDs (h001) or SKUs (SCOPE-VTX-4-16); the system resolves both. Limit items to 3.

CURRENT MERCHANDISING STATE:
${JSON.stringify(currentRules, null, 2)}

CATALOG (JSON, for context when picking SKUs):
${JSON.stringify(catalog)}

RULES:
1. ALWAYS respond with valid JSON in EXACTLY this shape — no markdown, no preamble, no commentary outside the JSON:
   {
     "message": "your reply to the admin (1-2 sentences)",
     "suggestions": [
       { "kind": "banner", "persona": "hunter|parent|fitness|guest", "text": "new banner copy", "label": "short label for apply button" },
       { "kind": "pinSkus", "skus": ["h001", "h003"], "category": "hunting", "label": "Pin Vortex scope + Ravin crossbow for hunting" },
       { "kind": "unpinSkus", "skus": ["h002"], "label": "Unpin Ameristep blind" },
       { "kind": "pdpModule", "persona": "hunter|parent|fitness|guest", "title": "new title (optional)", "items": ["h001","h003","h008"], "label": "Swap PDP picks for Jake" },
       { "kind": "info", "label": "explanation without an action" }
     ]
   }
2. Banner copy should be short (under 80 chars), punchy, and match the persona's tone.
3. SKU suggestions must use real catalog IDs.
4. Each suggestion needs a clear short "label" (under 50 chars) that becomes the Apply button text.
5. Return 1-4 suggestions. Use "info" kind for explanatory responses where no action applies.
6. Reasoning about strategy or summarizing the current state = use "info" kind.
7. If asked to make multiple persona banner changes, return a separate "banner" suggestion per persona.
8. Be confident and action-oriented. Never tell the admin "I don't recognize that persona" — translate names to keys yourself using the mapping above.
9. When asked about ANY category (not just hunting), suggest SKUs from that category's products in the catalog. The pinning system supports all 5 categories.
10. For pdpModule: either title or items (or both) — never empty. If admin asks "rename the PDP section for Maria to X", emit only title. If they ask "swap the PDP items for Alex to running gear", emit only items. The persona key is required.`;

  const messages = [
    ...conversationHistory.map(m => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: m.text,
    })),
    { role: 'user', content: userText },
  ];

  const usingProxy = Boolean(LLM_CONFIG.proxyUrl);
  const url = usingProxy ? LLM_CONFIG.proxyUrl : 'https://api.anthropic.com/v1/messages';
  const headers = usingProxy
    ? { 'Content-Type': 'application/json' }
    : {
        'Content-Type': 'application/json',
        'x-api-key': LLM_CONFIG.apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: LLM_CONFIG.model,
        max_tokens: 1500,
        system: systemPrompt,
        messages,
      }),
    });
    if (!response.ok) {
      console.warn('Merch LLM call failed:', response.status);
      return null;
    }
    const data = await response.json();
    const textBlock = data.content?.find(b => b.type === 'text');
    if (!textBlock) return null;
    const jsonStr = extractJsonFromLLM(textBlock.text);
    if (!jsonStr) {
      console.warn('Merch LLM: no JSON in response. Text:', textBlock.text.slice(0, 200));
      return { message: textBlock.text, suggestions: [] };
    }
    let parsed;
    try {
      parsed = JSON.parse(jsonStr);
    } catch (e) {
      console.warn('Merch LLM: JSON.parse failed.', e.message);
      return { message: textBlock.text, suggestions: [] };
    }
    return {
      message: parsed.message || 'Here are my suggestions:',
      suggestions: parsed.suggestions || [],
    };
  } catch (err) {
    console.error('Merch LLM error:', err);
    return null;
  }
}

// ----- VISUAL SEARCH LLM CALL ----------------------------------------------
// Real Claude vision call. Takes a base64 image (no data: prefix) and a media type.
// Returns { products: [...], reasoning: string } or null on failure.
async function callLLMForImage(base64Image, mediaType) {
  if (!LLM_CONFIG.enabled) return { error: 'disabled' };

  const catalog = await buildCatalogContext();
  // Strip photo URLs from the catalog before serializing — they bloat the prompt
  // by ~25KB and aren't useful for vision-based matching (Claude can't see them).
  const lean = catalog.map(p => ({
    id: p.id, name: p.name, brand: p.brand, category: p.category,
    subcategory: p.subcategory, price: p.price, tags: p.tags,
  }));
  const systemPrompt = `You are a visual product matcher for Academy Sports + Outdoors. The user has uploaded an image. Identify what's in the image, then find the 3-5 best matches from our catalog.

CATALOG (JSON):
${JSON.stringify(lean)}

RULES:
1. RESPOND WITH ONLY A SINGLE JSON OBJECT. No markdown code fences. No preamble. No commentary or notes before, after, or outside the JSON. The first character of your response MUST be { and the last character MUST be }.
2. The JSON shape:
   {
     "identified": "what you see in the image (one sentence)",
     "results": [
       { "id": "f001", "reason": "why this is a match (one sentence, under 20 words)" }
     ]
   }
3. Return 3-5 results, ordered best match first.
4. Only use product IDs that exist in the catalog above.
5. If the image contains something we don't carry (e.g. ski equipment), say so in "identified"
   and return your closest available alternatives in "results". If you need to caveat that the item isn't a category you carry, do so INSIDE the "identified" field, never outside the JSON.
6. Match on category, type, color, style, and use case where visible.`;

  const usingProxy = Boolean(LLM_CONFIG.proxyUrl);
  const url = usingProxy ? LLM_CONFIG.proxyUrl : 'https://api.anthropic.com/v1/messages';
  const headers = usingProxy
    ? { 'Content-Type': 'application/json' }
    : {
        'Content-Type': 'application/json',
        'x-api-key': LLM_CONFIG.apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      };

  const requestBody = {
    model: LLM_CONFIG.model,
    max_tokens: 1024,
    system: systemPrompt,
    messages: [{
      role: 'user',
      content: [
        { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64Image } },
        { type: 'text', text: 'Identify this product and find the closest matches in our catalog.' },
      ],
    }],
  };

  // === VISION DEBUG: log outgoing request shape (NOT the image data itself) ===
  console.log('🔍 VISION_DEBUG.fetch outgoing:', {
    url,
    usingProxy,
    method: 'POST',
    headers: Object.keys(headers),
    model: requestBody.model,
    max_tokens: requestBody.max_tokens,
    systemPromptLength: systemPrompt.length,
    catalogItemCount: lean.length,
    messageContentBlocks: requestBody.messages[0].content.map(b => ({
      type: b.type,
      ...(b.type === 'image' ? {
        sourceType: b.source.type,
        media_type: b.source.media_type,
        dataLength: b.source.data?.length,
      } : { textLength: b.text?.length }),
    })),
    estimatedPayloadKB: (JSON.stringify(requestBody).length / 1024).toFixed(1) + ' KB',
  });

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
    });

    console.log('🔍 VISION_DEBUG.fetch response status:', response.status, response.statusText);

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      console.error('🔍 VISION_DEBUG.fetch FAILED:', {
        status: response.status,
        statusText: response.statusText,
        errorBody: errText,
        // Try to parse it as JSON for prettier display
        errorParsed: (() => { try { return JSON.parse(errText); } catch { return null; } })(),
      });
      return { error: `http_${response.status}`, detail: errText.slice(0, 500) };
    }
    const data = await response.json();
    console.log('🔍 VISION_DEBUG.fetch response JSON:', {
      contentBlockCount: data.content?.length,
      contentBlockTypes: data.content?.map(b => b.type),
      stopReason: data.stop_reason,
      usage: data.usage,
    });

    const textBlock = data.content?.find(b => b.type === 'text');
    if (!textBlock) {
      console.warn('🔍 VISION_DEBUG: no text block in Claude response. Full data:', data);
      return { error: 'no_text_block' };
    }
    console.log('🔍 VISION_DEBUG.text block raw:', textBlock.text.slice(0, 500));

    const jsonStr = extractJsonFromLLM(textBlock.text);
    let parsed;
    try {
      if (!jsonStr) throw new Error('No JSON object found in response');
      parsed = JSON.parse(jsonStr);
    } catch (parseErr) {
      console.error('🔍 VISION_DEBUG: JSON.parse failed.', { parseErr: parseErr.message, extracted: jsonStr?.slice(0, 300), raw: textBlock.text.slice(0, 300) });
      return { error: 'json_parse_failed', detail: textBlock.text.slice(0, 300) };
    }
    if (!parsed?.results) {
      console.warn('🔍 VISION_DEBUG: parsed response missing results field. Parsed:', parsed);
      return { error: 'no_results_field' };
    }
    const validIds = new Set(lean.map(p => p.id));
    const beforeFilter = parsed.results.length;
    parsed.results = parsed.results.filter(r => validIds.has(r.id));
    console.log('🔍 VISION_DEBUG: id filter:', { before: beforeFilter, after: parsed.results.length, identified: parsed.identified });
    return parsed;
  } catch (err) {
    console.error('🔍 VISION_DEBUG: network/JS exception:', err);
    return { error: 'exception', detail: err.message };
  }
}

// ----- KIT BUILDER LLM CALL ------------------------------------------------
// Returns { thoughts: string[], items: [{ id, qty, reason, cat }] }
// Uses the same proxy/direct transport as callLLM but with a kit-specific prompt.
async function callLLMForKit(scenarioText) {
  const catalog = await buildCatalogContext();
  const systemPrompt = `You are the AI Kit Builder for Academy Sports + Outdoors. Given a scenario, you reason through the customer's needs and assemble a ready-to-cart kit from the real catalog.

CATALOG (JSON):
${JSON.stringify(catalog)}

RULES:
1. ALWAYS respond with valid JSON in EXACTLY this shape — no markdown, no preamble:
   {
     "thoughts": ["reasoning step 1", "reasoning step 2", ...],
     "items": [{ "id": "h001", "qty": 1, "reason": "why this item", "cat": "Category Label" }]
   }
2. Provide 3-6 reasoning thoughts that show how you're analyzing the scenario.
   Each thought should be a single sentence, ending with a period or ellipsis.
   Show your reasoning about budget, count of people, environment, priorities.
3. Items must reference real product IDs from the catalog above. NEVER invent IDs.
4. Pick 3-8 items total. Use qty > 1 only when it makes sense (e.g. multiple people).
5. "reason" should be one sentence explaining why this specific SKU.
6. "cat" is a short human label like "Shelter", "Footwear", "Cooking", "Optics".
7. If the scenario doesn't match anything in our catalog (e.g. ski equipment which we don't carry),
   still return your best general outdoor recommendations and acknowledge limits in the thoughts.
8. Stay within budget if one is mentioned. Sum your picks' prices mentally.`;

  const usingProxy = Boolean(LLM_CONFIG.proxyUrl);
  if (!LLM_CONFIG.enabled) return null;   // no LLM — caller handles fallback

  const url = usingProxy ? LLM_CONFIG.proxyUrl : 'https://api.anthropic.com/v1/messages';
  const headers = usingProxy
    ? { 'Content-Type': 'application/json' }
    : {
        'Content-Type': 'application/json',
        'x-api-key': LLM_CONFIG.apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: LLM_CONFIG.model,
        max_tokens: 1500,
        system: systemPrompt,
        messages: [{ role: 'user', content: scenarioText }],
      }),
    });
    if (!response.ok) {
      console.warn('Kit LLM call failed:', response.status);
      return null;
    }
    const data = await response.json();
    const textBlock = data.content?.find(b => b.type === 'text');
    if (!textBlock) return null;
    const jsonStr = extractJsonFromLLM(textBlock.text);
    if (!jsonStr) {
      console.warn('Kit LLM: no JSON in response. Text:', textBlock.text.slice(0, 200));
      return null;
    }
    let parsed;
    try {
      parsed = JSON.parse(jsonStr);
    } catch (e) {
      console.warn('Kit LLM: JSON.parse failed.', e.message);
      return null;
    }
    if (!parsed?.thoughts || !parsed?.items) return null;
    // Validate items reference real catalog IDs
    const validIds = new Set(catalog.map(p => p.id));
    parsed.items = parsed.items.filter(it => validIds.has(it.id));
    if (parsed.items.length === 0) return null;
    return parsed;
  } catch (err) {
    console.error('Kit LLM error:', err);
    return null;
  }
}

/* ============================================================================
   PERSONALIZATION / DISRUPTION ENGINE
   - sendEmail: posts to the Worker's /v1/email route (Resend) — real delivery.
   - draftPersonalizedEmail: asks Claude to write a tailored email for one of
     several scenarios (delay, cancel, back-in-stock, win-back, price-drop),
     grounded in the customer's real order history.
   - pickAlternate: chooses an in-stock catalog substitute for a cancelled item.
   ============================================================================ */

// Real email send through the Worker proxy (Resend server-side).
async function sendEmail({ to, subject, html, text }) {
  // DEMO FALLBACK: Resend free tier (onboarding@resend.dev sender, no verified
  // domain) only delivers to the account owner. Redirect all sends there so the
  // lifecycle/disruption emails actually arrive. Redirected to the Resend account
  // owner's verified address so the free tier delivers them.
  // REMOVE this line once a domain is verified in Resend + RESEND_FROM is set.
  to = 'anant.jadon25@gmail.com';

  if (!LLM_CONFIG.proxyUrl) {
    return { success: false, error: 'No proxy configured — email requires the Cloudflare Worker.' };
  }
  // Email route lives alongside /v1/messages on the same Worker.
  const base = LLM_CONFIG.proxyUrl.replace(/\/v1\/messages\/?$/, '').replace(/\/+$/, '');
  const url = `${base}/v1/email`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, subject, html, text }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { success: false, error: data?.error || `Email failed (${res.status})` };
    return { success: true, id: data?.id || null };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// ---- Agent client helpers (talk to the Worker's KV-backed agent routes) ----
function _workerBase() {
  return (LLM_CONFIG.proxyUrl || '').replace(/\/v1\/messages\/?$/, '').replace(/\/+$/, '');
}
// Build the email discount-accept link (Worker route → applies discount + marks accepted).
// Builds the URL embedded in delay-with-alternate emails. Clicking it cancels
// the original Shopify order and creates a new one for the alternate (worker
// side: /v1/disruption/swap). Demo-only — link is unauthenticated.
function swapAcceptUrl({ key, orderGid, variantGid, qty, title, price, origName }) {
  const base = _workerBase();
  if (!base || !key || !orderGid || !variantGid) return null;
  const qs = new URLSearchParams({
    key,
    order: orderGid,
    variant: variantGid,
    qty: String(qty || 1),
    title: title || 'alternate',
    price: price != null ? String(price) : '',
    origName: origName || '',
  });
  return `${base}/v1/disruption/swap?${qs.toString()}`;
}

function agentAcceptUrl(key, itemId) {
  const base = _workerBase();
  return `${base}/v1/agent/accept?key=${encodeURIComponent(key)}&item=${encodeURIComponent(itemId)}`;
}
// Push the browser's cart/conversion snapshot to KV so the cron agent can continue.
async function agentSyncState({ key, cart, converted, lastPurchaseAt }) {
  const base = _workerBase();
  if (!base || !key) return null;
  try {
    const res = await fetch(`${base}/v1/agent/state`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, cart, converted, lastPurchaseAt }),
    });
    return await res.json().catch(() => null);
  } catch { return null; }
}
// Read agent state back (to detect email-link acceptance → apply discount in-app).
async function agentReadState(key) {
  const base = _workerBase();
  if (!base || !key) return null;
  try {
    const res = await fetch(`${base}/v1/agent/state?key=${encodeURIComponent(key)}`);
    const data = await res.json().catch(() => null);
    return data?.state || null;
  } catch { return null; }
}

// ----- Close the loop: write the placed order back to Shopify -----------------
// Calls the Worker's /v1/shopify/order route, which uses the Admin API to create
// a real order on the dev store. Shopify then attaches it to the customer's
// account (linked by email) and auto-decrements inventory. Best-effort: callers
// continue the "placed" UI regardless of outcome and log on failure.
async function placeShopifyOrder({ customerEmail, lineItems, note }) {
  const base = _workerBase();
  if (!base) return { success: false, error: 'No proxy configured' };
  if (!customerEmail || !Array.isArray(lineItems) || lineItems.length === 0) {
    return { success: false, error: 'Missing customerEmail or lineItems' };
  }
  try {
    const res = await fetch(`${base}/v1/shopify/order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customerEmail, lineItems, note }),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      return { success: false, error: data?.error || `HTTP ${res.status}`, details: data?.details || data };
    }
    return { success: true, order: data?.order || null };
  } catch (e) {
    return { success: false, error: String(e?.message || e) };
  }
}

// ----- Self-signup: create a real Shopify customer in real time --------------
// Calls the Worker's /v1/shopify/customer route (Admin API). Returns the new
// (or existing, if the email was already registered) customer record. This is
// profile creation, not authenticated login — no password is collected or set;
// the app reads this customer's record + order history via Admin afterward.
async function createShopifyCustomer({ firstName, lastName, email, zip, city, province }) {
  const base = _workerBase();
  if (!base) return { success: false, error: 'No proxy configured' };
  if (!email) return { success: false, error: 'Email is required' };
  try {
    const res = await fetch(`${base}/v1/shopify/customer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ firstName, lastName, email, zip, city, province }),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) return { success: false, error: data?.error || `HTTP ${res.status}`, details: data?.details };
    return { success: true, customer: data?.customer || null, existed: !!data?.existed };
  } catch (e) {
    return { success: false, error: String(e?.message || e) };
  }
}

// Fetch a self-signup customer's orders via Admin (they have no Storefront
// token). Normalizes to the SAME shape ShopifyAdapter.getCustomerOrders returns
// so the rest of the app (Orders page, chat grounding, disruption) is agnostic.
async function fetchAdminCustomerOrders(customerId) {
  const base = _workerBase();
  if (!base || !customerId) return [];
  try {
    const res = await fetch(`${base}/v1/shopify/customer-orders?customerId=${encodeURIComponent(customerId)}`);
    const data = await res.json().catch(() => null);
    if (!res.ok || !data?.success) return [];
    const now = Date.now();
    return (data.orders || []).map(o => {
      const d = o.processedAt ? new Date(o.processedAt) : new Date();
      return {
        id: o.id || null,
        orderNumber: o.orderNumber,
        date: d,
        daysAgo: Math.max(0, Math.floor((now - d.getTime()) / 86400000)),
        total: o.total || 0,
        currency: o.currency || 'USD',
        items: (o.items || []).map(it => ({
          title: it.title,
          quantity: it.quantity,
          handle: null,        // Admin order line-items don't carry the handle
          category: '',
          photo: null,
          price: it.price || 0,
        })),
      };
    });
  } catch { return []; }
}

// Pick an in-stock alternate for a cancelled item: same category, closest price,
// preferring higher rating. Excludes the cancelled product itself.
function pickAlternate(cancelledItem, catalog) {
  if (!cancelledItem) return null;
  const cat = cancelledItem.category;
  const price = cancelledItem.price || 0;
  const pool = catalog.filter(p =>
    (!cat || p.category === cat) &&
    p.name !== cancelledItem.title &&
    p.id !== cancelledItem.handle
  );
  const ranked = (pool.length ? pool : catalog.filter(p => p.name !== cancelledItem.title))
    .map(p => ({ p, score: Math.abs((p.price || 0) - price) - (p.rating || 0) * 5 }))
    .sort((a, b) => a.score - b.score);
  return ranked[0]?.p || null;
}

// Build a re-evaluated ETA string for a delayed order.
function reEvaluatedEta(extraDays = 3) {
  const d = new Date(Date.now() + extraDays * 86400000);
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
}

// Ask Claude to draft a personalized email for a given scenario. Returns
// { subject, html, text } or null. Falls back to a templated email if the LLM
// is unavailable, so the demo never dead-ends.
async function draftPersonalizedEmail({ scenario, persona, customer, orders, focusItem, alternate, eta, homeStore, delayDays, acceptSwapUrl, inStoreOption }) {
  const pName = customer?.firstName || PERSONAS[persona]?.name || 'there';
  const historyLines = (orders || []).slice(0, 5).map(o =>
    `- ${o.daysAgo != null ? o.daysAgo + ' days ago' : 'recently'}: ${o.items.map(i => i.title).join(', ')} ($${(o.total || 0).toFixed(2)})`
  ).join('\n');

  const scenarioBrief = {
    delay: alternate
      ? `One of ${pName}'s orders is delayed by ${delayDays || 'several'} days — that's longer than we'd like. New ETA: ${eta}. Apologize briefly, then PROACTIVELY present this in-stock alternative as a faster option: "${alternate?.name}" ($${alternate?.price?.toFixed(2)}). Explain in one line why it's a good match for ${pName}. Tell them they can wait for the original OR accept the alternate (we'll cancel the delayed order and ship the alternate right away) — there will be a button below to accept. Warm, helpful, not corporate.`
      : (inStoreOption
        ? `One of ${pName}'s orders is delayed by ${delayDays || 'a few'} days. New ETA: ${eta}. Apologize briefly, then OFFER a faster in-store pickup option: "${focusItem?.title}" is on the shelf at our ${inStoreOption.store.name}${inStoreOption.isHome ? ' (their home store)' : ''} location — ${inStoreOption.store.address}, open ${inStoreOption.store.hours}. They can grab it today, no shipping wait. Frame it as a friendly local heads-up, not a downgrade. Mention the address and hours clearly so they can act on it.`
        : `One of ${pName}'s orders is delayed by ${delayDays || 'a few'} days. Reassure them, apologize briefly, give the new estimated delivery date: ${eta}. Offer a small good-will gesture (free expedited shipping on the next order). Keep it warm and confident, not corporate.`),
    cancel: inStoreOption
      ? `An item in ${pName}'s online order had to be cancelled because we're out of stock online: "${focusItem?.title}". Be honest about this, then give them TWO clear options: (1) The same item IS available right now at our ${inStoreOption.store.name} store${inStoreOption.isHome ? ' (their home store)' : ''} — ${inStoreOption.store.address}, open ${inStoreOption.store.hours} — they can pick it up the same day. (2) OR we can ship them this in-stock alternative right away: "${alternate?.name}" ($${alternate?.price?.toFixed(2)}). Present both options clearly, let ${pName} pick. The accept-alternate button below handles option 2.`
      : `An item in ${pName}'s order had to be cancelled (out of stock everywhere): "${focusItem?.title}". Apologize, and proactively recommend this in-stock alternative we can ship right away: "${alternate?.name}" ($${alternate?.price?.toFixed(2)}). Explain in one line why it's a good match. Offer to swap it with one click.`,
    backInStock: `An item ${pName} bought before is popular and back in stock: "${focusItem?.title}". Let them know it's available again at their ${homeStore?.city || 'local'} store, in case they want to restock.`,
    winBack: `${pName} hasn't ordered in a while. Write a friendly win-back note referencing what they bought before, with a light incentive (10% off their category) to come back. No guilt, just warmth.`,
    priceDrop: `The price dropped on something ${pName} bought or viewed: "${focusItem?.title}". Let them know it's now on sale and worth grabbing again or gifting.`,
  }[scenario] || '';

  const systemPrompt = `You are the lifecycle email writer for Academy Sports + Outdoors, a US sporting goods retailer. Write a single, concise, genuinely personalized email. Tone: warm, human, confident — like a helpful store associate, not a marketing blast.

CUSTOMER: ${pName}${customer?.lastName ? ' ' + customer.lastName : ''} (persona: ${persona})
${historyLines ? `THEIR RECENT ORDERS:\n${historyLines}` : 'No order history available.'}
${homeStore ? `THEIR STORE: ${homeStore.name} (${homeStore.city})` : ''}

SCENARIO: ${scenarioBrief}

Reference their real purchases naturally where it helps. Keep the body under 130 words. Sign off as "The Academy Sports + Outdoors Team".

Return ONLY valid JSON, no preamble, no markdown fences:
{ "subject": "...", "text": "plain text body", "html": "<p>...</p> simple HTML body" }`;

  const usingProxy = Boolean(LLM_CONFIG.proxyUrl);
  if (!LLM_CONFIG.enabled) {
    return _fallbackEmail({ scenario, pName, focusItem, alternate, eta, homeStore, delayDays, acceptSwapUrl, inStoreOption });
  }
  const url = usingProxy ? LLM_CONFIG.proxyUrl : 'https://api.anthropic.com/v1/messages';
  const headers = usingProxy
    ? { 'Content-Type': 'application/json' }
    : { 'Content-Type': 'application/json', 'x-api-key': LLM_CONFIG.apiKey, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: LLM_CONFIG.model,
        max_tokens: 700,
        system: systemPrompt,
        messages: [{ role: 'user', content: 'Write the email now. Return only the JSON.' }],
      }),
    });
    if (!res.ok) return _fallbackEmail({ scenario, pName, focusItem, alternate, eta, homeStore, delayDays, acceptSwapUrl, inStoreOption });
    const data = await res.json();
    const textBlock = (data.content || []).find(b => b.type === 'text')?.text || '';
    const jsonStr = textBlock.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(jsonStr);
    if (!parsed.subject || (!parsed.html && !parsed.text)) {
      return _fallbackEmail({ scenario, pName, focusItem, alternate, eta, homeStore, delayDays, acceptSwapUrl, inStoreOption });
    }
    // For delay-with-alternate: append a CTA button to the LLM-drafted HTML.
    // We don't trust the LLM to format the swap URL exactly right, so we own this.
    if (acceptSwapUrl && alternate) {
      const cta = `<p style="margin-top:24px"><a href="${acceptSwapUrl}" style="display:inline-block;padding:14px 28px;background:#2563eb;color:#0a0a0f;border-radius:999px;text-decoration:none;font-weight:700">Accept the alternate — ship now</a></p><p style="color:#888;font-size:12px;margin-top:8px">Clicking the button cancels the delayed order and ships ${alternate.name} right away.</p>`;
      parsed.html = (parsed.html || '') + cta;
      parsed.text = (parsed.text || '') + `\n\nAccept the alternate (${alternate.name}) and we will cancel the delayed order: ${acceptSwapUrl}`;
    }
    return parsed;
  } catch (e) {
    console.warn('Email draft LLM failed, using fallback:', e.message);
    return _fallbackEmail({ scenario, pName, focusItem, alternate, eta, homeStore, delayDays, acceptSwapUrl, inStoreOption });
  }
}

// Templated fallback so a flaky LLM never breaks the demo.
function _fallbackEmail({ scenario, pName, focusItem, alternate, eta, homeStore, delayDays, acceptSwapUrl, inStoreOption }) {
  const sign = '<p>— The Academy Sports + Outdoors Team</p>';
  const ctaButton = (acceptSwapUrl && alternate)
    ? `<p style="margin-top:24px"><a href="${acceptSwapUrl}" style="display:inline-block;padding:14px 28px;background:#2563eb;color:#0a0a0f;border-radius:999px;text-decoration:none;font-weight:700">Accept the alternate — ship now</a></p><p style="color:#888;font-size:12px;margin-top:8px">Clicking the button cancels the delayed order and ships ${alternate.name} right away.</p>`
    : '';
  const ctaText = (acceptSwapUrl && alternate) ? `\n\nAccept the alternate (${alternate.name}) and we will cancel the delayed order: ${acceptSwapUrl}` : '';
  const wrap = (subject, body, extraHtml = '', extraText = '') => ({
    subject,
    html: `${body}${extraHtml}${sign}`,
    text: body.replace(/<[^>]+>/g, '') + extraText + '\n— The Academy Sports + Outdoors Team',
  });
  switch (scenario) {
    case 'delay':
      if (alternate && acceptSwapUrl) {
        return wrap(
          `Your order is delayed — here's a faster option`,
          `<p>Hi ${pName},</p><p>Your recent order is running ${delayDays || 'several'} days behind — we're sorry. Updated ETA: <strong>${eta}</strong>.</p><p>If you'd rather not wait, we have <strong>${alternate?.name}</strong> ($${alternate?.price?.toFixed(2)}) in stock and can ship it right away. We'll cancel the delayed order and you keep the savings.</p>`,
          ctaButton, ctaText
        );
      }
      if (inStoreOption) {
        return wrap(
          `Your order is delayed — but it's on our shelf nearby`,
          `<p>Hi ${pName},</p><p>Your recent order is running about ${delayDays || 'a few'} days behind — sorry about that. New ETA: <strong>${eta}</strong>.</p><p>Heads up: "${focusItem?.title}" is on the shelf at our <strong>${inStoreOption.store.name}</strong>${inStoreOption.isHome ? ' (your home store)' : ''} location right now. If you'd rather pick it up today instead of waiting:</p><p style="margin:14px 0;padding:12px 14px;background:#f5f7ff;border-radius:8px;font-size:14px"><strong>${inStoreOption.store.name}</strong><br/>${inStoreOption.store.address}<br/><span style="color:#666">${inStoreOption.store.hours}</span></p>`
        );
      }
      return wrap(`A quick update on your order`, `<p>Hi ${pName},</p><p>Your recent order is running a little behind — we're sorry for the wait. Your updated delivery date is <strong>${eta}</strong>. To make up for it, your next order ships expedited on us.</p>`);
    case 'cancel':
      if (inStoreOption) {
        return wrap(
          `"${focusItem?.title}" — out online, but in stock locally`,
          `<p>Hi ${pName},</p><p>Bad news first: "${focusItem?.title}" sold out online before we could ship it. Two ways we can make it right:</p><p style="margin:14px 0;padding:12px 14px;background:#f5f7ff;border-radius:8px;font-size:14px"><strong>Option 1 · Pick it up locally</strong><br/>The same item is on the shelf at <strong>${inStoreOption.store.name}</strong>${inStoreOption.isHome ? ' (your home store)' : ''}<br/>${inStoreOption.store.address}<br/><span style="color:#666">${inStoreOption.store.hours}</span></p><p style="margin:14px 0;padding:12px 14px;background:#fff5f0;border-radius:8px;font-size:14px"><strong>Option 2 · We ship you an alternative</strong><br/><strong>${alternate?.name}</strong> · $${alternate?.price?.toFixed(2)} — in stock and ready to go.</p>`,
          ctaButton, ctaText
        );
      }
      return wrap(`We've got a great alternative for you`, `<p>Hi ${pName},</p><p>Unfortunately "${focusItem?.title}" sold out before we could ship it. The good news: <strong>${alternate?.name}</strong> ($${alternate?.price?.toFixed(2)}) is in stock and a great match — we can ship it right away. Just reply or tap to swap.</p>`);
    case 'backInStock':
      return wrap(`Back in stock at your store`, `<p>Hi ${pName},</p><p>"${focusItem?.title}" is back in stock${homeStore ? ` at ${homeStore.name}` : ''} — grab it before it's gone again.</p>`);
    case 'winBack':
      return wrap(`We miss you, ${pName}`, `<p>Hi ${pName},</p><p>It's been a while! Here's 10% off your next order to welcome you back.</p>`);
    case 'priceDrop':
      return wrap(`Price drop on something you love`, `<p>Hi ${pName},</p><p>"${focusItem?.title}" just dropped in price — now's a great time to grab another.</p>`);
    default:
      return wrap(`An update from Academy`, `<p>Hi ${pName},</p><p>We've got an update on your account.</p>`);
  }
}

const CT_CONFIG = {
  // Fill these in to flip to live mode. Leave empty for stub mode (demo-safe).
  authUrl: '',        // e.g. 'https://auth.us-central1.gcp.commercetools.com'
  apiUrl: '',         // e.g. 'https://api.us-central1.gcp.commercetools.com'
  projectKey: '',     // e.g. 'academy-sports-demo'
  clientId: '',
  clientSecret: '',
  scopes: 'view_products view_categories manage_orders',
  locale: 'en-US',
  currency: 'USD',
  country: 'US',
};

class CommercetoolsAdapter extends CommerceAdapter {
  constructor(config = CT_CONFIG) {
    super();
    this.config = config;
    this.isLive = Boolean(config.authUrl && config.apiUrl && config.projectKey && config.clientId);
    this._token = null;          // { access_token, expires_at }
    this._tokenPromise = null;   // de-dupe in-flight token refresh
    // commercetools-shaped projection of the demo catalog (for stub mode)
    this._catalog = CATALOG.map(p => this._toProductProjection(p));
    // commercetools-shaped categories (stub)
    this._categories = [
      { id: 'cat-hunting', key: 'hunting', name: { 'en-US': 'Hunting' }, slug: { 'en-US': 'hunting' } },
      { id: 'cat-team-sports', key: 'team-sports', name: { 'en-US': 'Team Sports' }, slug: { 'en-US': 'team-sports' } },
      { id: 'cat-fitness', key: 'fitness', name: { 'en-US': 'Fitness' }, slug: { 'en-US': 'fitness' } },
      { id: 'cat-camping', key: 'camping', name: { 'en-US': 'Camping' }, slug: { 'en-US': 'camping' } },
    ];
    // Custom objects shape for merchandising (commercetools convention: container/key)
    this._merchObjects = {
      'home-hero': { container: 'merchandising', key: 'home-hero', value: { hunter: 'Pre-Season Ready. Built for the Hunt.', parent: 'Game Day Starts Here.', fitness: 'Move Better. Save More.', guest: 'Sport, Outdoors, All Year Round.' }, version: 1 },
    };
  }

  // ---- OAuth client-credentials token lifecycle --------------------------
  async _getAccessToken() {
    if (!this.isLive) return null; // stub mode skips auth entirely
    const now = Date.now();
    if (this._token && this._token.expires_at > now + 30000) return this._token.access_token;
    if (this._tokenPromise) return this._tokenPromise;
    this._tokenPromise = (async () => {
      const body = new URLSearchParams({ grant_type: 'client_credentials', scope: `${this.config.scopes}:${this.config.projectKey}` });
      const auth = btoa(`${this.config.clientId}:${this.config.clientSecret}`);
      const res = await fetch(`${this.config.authUrl}/oauth/token`, {
        method: 'POST',
        headers: { 'Authorization': `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
      });
      if (!res.ok) throw new Error(`OAuth failed: ${res.status}`);
      const data = await res.json();
      this._token = { access_token: data.access_token, expires_at: now + (data.expires_in * 1000) };
      this._tokenPromise = null;
      return this._token.access_token;
    })();
    return this._tokenPromise;
  }

  async _api(path, opts = {}) {
    if (!this.isLive) return null;
    const token = await this._getAccessToken();
    const res = await fetch(`${this.config.apiUrl}/${this.config.projectKey}${path}`, {
      ...opts,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...(opts.headers || {}),
      },
    });
    if (!res.ok) throw new Error(`CT API ${path}: ${res.status}`);
    return res.json();
  }

  // ---- Boundary mappers: CT shape ↔ UI shape -----------------------------
  _toProductProjection(p) {
    // Build a commercetools-shaped ProductProjection from the flat demo product
    const prices = [{
      id: `price-${p.id}`,
      value: { type: 'centPrecision', currencyCode: this.config.currency, centAmount: Math.round(p.price * 100), fractionDigits: 2 },
      country: this.config.country,
    }];
    if (p.compareAt) {
      prices[0].discounted = { value: { type: 'centPrecision', currencyCode: this.config.currency, centAmount: Math.round(p.price * 100), fractionDigits: 2 } };
      prices[0].value.centAmount = Math.round(p.compareAt * 100);
    }
    return {
      id: `prod-${p.id}`,
      key: p.id,
      version: 1,
      productType: { typeId: 'product-type', id: `pt-${p.category}` },
      name: { [this.config.locale]: p.name },
      description: { [this.config.locale]: `Premium ${p.brand} ${p.subcategory || p.category} — top-rated by customers.` },
      slug: { [this.config.locale]: p.id },
      categories: [{ typeId: 'category', id: `cat-${p.category}` }],
      masterVariant: {
        id: 1,
        sku: p.sku,
        prices,
        images: [{ url: `internal://illustration/${p.id}`, dimensions: { w: 800, h: 800 } }],
        attributes: [
          { name: 'brand', value: p.brand },
          { name: 'subcategory', value: p.subcategory },
          { name: 'rating', value: p.rating },
          { name: 'reviewCount', value: p.reviews },
          { name: 'tags', value: p.tags || [] },
          ...(p.spec ? Object.entries(p.spec).map(([k, v]) => ({ name: k, value: v })) : []),
        ],
        availability: { isOnStock: true, availableQuantity: 50 },
      },
      variants: [],
      hasStagedChanges: false,
      published: true,
      reviewRatingStatistics: { averageRating: p.rating, count: p.reviews },
    };
  }

  _toUIProduct(projection) {
    // Map commercetools ProductProjection back to the UI's flat product shape
    const locale = this.config.locale;
    const mv = projection.masterVariant;
    const attrs = Object.fromEntries((mv.attributes || []).map(a => [a.name, a.value]));
    const price = mv.prices?.[0];
    const centAmount = price?.value?.centAmount || 0;
    const hasDiscount = price?.discounted;
    // In CT, `value` is the LIST price and `discounted.value` is the SALE price.
    const finalPrice = hasDiscount ? hasDiscount.value.centAmount / 100 : centAmount / 100;
    const compareAt = hasDiscount ? centAmount / 100 : undefined;
    // Recover catalog meta we need for illustrations + spec block
    const sourceFromCatalog = CATALOG.find(p => p.id === projection.key);
    return {
      id: projection.key,
      sku: mv.sku,
      name: projection.name[locale] || Object.values(projection.name)[0],
      category: projection.categories[0]?.id?.replace('cat-', ''),
      subcategory: attrs.subcategory,
      price: finalPrice,
      compareAt,
      brand: attrs.brand,
      rating: attrs.rating,
      reviews: attrs.reviewCount,
      image: sourceFromCatalog?.image,
      tags: attrs.tags || [],
      spec: sourceFromCatalog?.spec,
      hero: sourceFromCatalog?.hero,
    };
  }

  // ---- Interface implementations -----------------------------------------
  async getProduct(id) {
    await this._latency();
    if (this.isLive) {
      const projection = await this._api(`/product-projections/key=${id}?priceCurrency=${this.config.currency}&priceCountry=${this.config.country}&localeProjection=${this.config.locale}`);
      return projection ? this._toUIProduct(projection) : null;
    }
    const projection = this._catalog.find(p => p.key === id);
    return projection ? this._toUIProduct(projection) : null;
  }

  async getProducts(filter = {}) {
    await this._latency();
    if (this.isLive) {
      // Build CT product-projection-search filter expressions
      const filters = [];
      if (filter.category) filters.push(`categories.id:"cat-${filter.category}"`);
      if (filter.subcategory) filters.push(`variants.attributes.subcategory:"${filter.subcategory}"`);
      if (filter.tags) filter.tags.forEach(t => filters.push(`variants.attributes.tags:"${t}"`));
      const params = new URLSearchParams({
        priceCurrency: this.config.currency,
        priceCountry: this.config.country,
        localeProjection: this.config.locale,
        limit: '50',
      });
      filters.forEach(f => params.append('filter', f));
      const res = await this._api(`/product-projections/search?${params}`);
      return (res?.results || []).map(p => this._toUIProduct(p));
    }
    // STUB: filter the projected catalog
    let results = this._catalog;
    if (filter.category) results = results.filter(p => p.categories.some(c => c.id === `cat-${filter.category}`));
    if (filter.subcategory) {
      results = results.filter(p => p.masterVariant.attributes.find(a => a.name === 'subcategory' && a.value === filter.subcategory));
    }
    if (filter.tags) {
      results = results.filter(p => {
        const tags = p.masterVariant.attributes.find(a => a.name === 'tags')?.value || [];
        return filter.tags.some(t => tags.includes(t));
      });
    }
    return results.map(p => this._toUIProduct(p));
  }

  async getCategory(slug) {
    await this._latency();
    if (this.isLive) {
      const res = await this._api(`/categories/key=${slug}`);
      return res ? { slug: res.key, name: res.name[this.config.locale], facets: [] } : null;
    }
    const cat = this._categories.find(c => c.key === slug);
    return cat ? { slug: cat.key, name: cat.name[this.config.locale], facets: [] } : null;
  }

  async search(query, opts = {}) {
    await this._latency(600);
    if (this.isLive) {
      // commercetools supports fuzzy search via text.{locale}
      const params = new URLSearchParams({
        [`text.${this.config.locale}`]: query,
        fuzzy: 'true',
        priceCurrency: this.config.currency,
        priceCountry: this.config.country,
        limit: '5',
      });
      const res = await this._api(`/product-projections/search?${params}`);
      return { results: (res?.results || []).map(p => ({ product: this._toUIProduct(p), reason: `Matched search term "${query}"` })) };
    }
    // STUB: defer to mock search semantics so locked stage queries still work
    return new MockAdapter().search(query, opts);
  }

  async visualSearch(imageMeta) {
    await this._latency(900);
    // commercetools has no native visual search — would integrate Google Vision / Algolia / custom embedding service
    // For both stub and live, defer to mock (the real impl would call out to an image embedding endpoint).
    return new MockAdapter().visualSearch(imageMeta);
  }

  async addToCart(items) {
    await this._latency();
    if (this.isLive) {
      // commercetools: create or update a Cart resource with lineItems
      const lineItems = items.map(i => ({ productId: `prod-${i.product.id}`, variantId: 1, quantity: i.qty }));
      const res = await this._api('/me/carts', { method: 'POST', body: JSON.stringify({ currency: this.config.currency, country: this.config.country, lineItems }) });
      return { success: true, cartId: res?.id, lineItems: items, total: items.reduce((s, i) => s + (i.product.price * i.qty), 0) };
    }
    return { success: true, lineItems: items, total: items.reduce((s, i) => s + (i.product.price * i.qty), 0) };
  }

  async getMerchandisingRules() {
    if (this.isLive) {
      // CT pattern: store rules as Custom Objects under a known container
      const res = await this._api(`/custom-objects/merchandising`);
      const rules = {};
      (res?.results || []).forEach(o => { rules[o.key] = o.value; });
      return rules;
    }
    const rules = {};
    Object.entries(this._merchObjects).forEach(([k, obj]) => { rules[k] = obj.value; });
    return rules;
  }

  async updateMerchandisingRule(id, payload) {
    await this._latency();
    if (this.isLive) {
      const res = await this._api('/custom-objects', {
        method: 'POST',
        body: JSON.stringify({ container: 'merchandising', key: id, value: payload, version: this._merchObjects[id]?.version }),
      });
      this._merchObjects[id] = { container: 'merchandising', key: id, value: res?.value || payload, version: (res?.version) || ((this._merchObjects[id]?.version || 0) + 1) };
      return { success: true };
    }
    this._merchObjects[id] = { container: 'merchandising', key: id, value: payload, version: (this._merchObjects[id]?.version || 0) + 1 };
    return { success: true };
  }

  _latency(ms = 350) { return new Promise(r => setTimeout(r, ms + Math.random() * 150)); }

  // Diagnostic — used by the admin panel
  describe() {
    return {
      name: 'CommercetoolsAdapter',
      mode: this.isLive ? 'LIVE' : 'STUB',
      projectKey: this.config.projectKey || '(not configured)',
      locale: this.config.locale,
      currency: this.config.currency,
    };
  }
}

/* ============================================================================
   ShopifyAdapter — calls Shopify's Storefront API (GraphQL, browser-safe).
   The Storefront API uses a public token that's safe to embed in client code
   (it's scoped to read-only or limited cart operations). Configure SHOPIFY_CONFIG
   below with your store's domain + Storefront access token to flip into LIVE mode.
   ============================================================================ */
const SHOPIFY_CONFIG = {
  // LIVE mode — real Shopify dev store with seeded catalog.
  storeDomain: 'aso-techday-demo.myshopify.com',
  storefrontToken: 'de86b20902517651488fadee3580f6ca',
  apiVersion: '2024-07',
};

// =============================================================================
//   SHOPIFY CATEGORY INFERENCE
//   Shopify productType is free-text and often inconsistent (blank, mistyped,
//   or not matching our 5 canonical categories), which can leak e.g. a rifle
//   onto the Fitness page. So we DON'T trust productType alone — we infer the
//   canonical category from the product title + tags (reliable), and fall back
//   to a normalized productType only when title/tags are inconclusive.
// =============================================================================
const CATEGORY_KEYWORDS = [
  ['hunting',     ['rifle','firearm',' gun','shotgun','ammo','ammunition','scope','optic','binocular','crossbow','broadhead','arrow','blind','decoy','deer','hunt','camo','treestand','game call','muzzle','holster','ravin','ruger']],
  ['fishing',     ['fishing','rod','reel','lure','tackle',' bait','hook','angler','kayak','spinning combo','baitcast']],
  ['team-sports', ['soccer','jersey','cleat','shin guard','shinguard','baseball','basketball','football','volleyball','youth','goalkeeper','team bundle']],
  ['fitness',     ['treadmill','dumbbell','kettlebell','barbell','weight','yoga','running','runner',' run ','cardio','fitness','workout','resistance','peloton','indoor cycle','spin bike','watch',' gps','tracker','foam roller','strength']],
  ['camping',     ['tent','cooler','sleeping bag','sleeping','campsite',' camp ','camping','lantern','stove','hammock','backpack','hydration','headlamp','canopy']],
];
const PRODUCTTYPE_NORMALIZE = {
  'hunting':'hunting','hunt':'hunting','firearms':'hunting','optics':'hunting',
  'fishing':'fishing',
  'team sports':'team-sports','team-sports':'team-sports','teamsports':'team-sports','sports':'team-sports',
  'fitness':'fitness','fitness & training':'fitness','fitness and training':'fitness','training':'fitness',
  'camping':'camping','outdoor':'camping','outdoors':'camping','camp':'camping',
};
function inferShopifyCategory(productType, title, tags) {
  const hay = ` ${(title || '').toLowerCase()} ${(tags || []).join(' ').toLowerCase()} `;
  for (const [cat, words] of CATEGORY_KEYWORDS) {
    if (words.some(w => hay.includes(w))) return cat;
  }
  const raw = (productType || '').toLowerCase().trim();
  if (PRODUCTTYPE_NORMALIZE[raw]) return PRODUCTTYPE_NORMALIZE[raw];
  return 'general';
}

class ShopifyAdapter extends CommerceAdapter {
  constructor(config) {
    super();
    this.config = config;
    this.live = Boolean(config.storeDomain && config.storefrontToken);
    this.endpoint = this.live
      ? `https://${config.storeDomain}/api/${config.apiVersion}/graphql.json`
      : null;
    this.merchRulesKey = 'aso_shopify_merch_rules';   // localStorage
    this._productCache = null;
    // Maps mock product IDs (h001, t002, etc.) → Shopify handles.
    // This lets the storefront's hardcoded references (home trays, kit builder
    // scripts, persona modules) keep working when the Shopify adapter is active.
    this._idToHandle = {
      h001: 'vortex-diamondback-scope',
      h002: 'ameristep-blind-360',
      h003: 'ravin-r26-crossbow',
      h004: 'barnett-whitetail-crossbow',
      h005: 'realtree-edge-jacket',
      h006: 'primos-deer-call',
      h007: 'muck-wetland-boots',
      h008: 'millennium-treestand',
      h009: 'vortex-binoculars-10x42',
      h010: 'ruger-ar556-rifle',
      h011: 'federal-3006-ammo',
      h012: 'alps-commander-pack',
      h013: 'buck-119-knife',
      h014: 'streamlight-protac',
      h015: 'reconyx-trail-cam',
      h016: 'hot-shot-gloves',
      t001: 'nike-jr-phantom-cleats',
      t002: 'adidas-mls-ball',
      t003: 'nike-shin-guards',
      t004: 'adidas-soccer-socks',
      t005: 'hydroflask-32oz',
      t006: 'nike-brasilia-duffel',
      t007: 'easton-baseball-bat',
      t008: 'rawlings-glove',
      t009: 'spalding-basketball',
      t010: 'lifetime-basketball-hoop',
      t011: 'wilson-football',
      t012: 'spalding-cones',
      t013: 'nike-jersey-youth',
      t014: 'demarini-voodoo-bat',
      f001: 'brooks-ghost-15',
      f002: 'asics-kayano-30',
      f003: 'hoka-arahi-7',
      f004: 'cap-dumbbell-set',
      f005: 'nike-dri-fit-tee',
      f006: 'manduka-yoga-mat',
      f007: 'nike-pegasus-40',
      f008: 'nb-fuelcell-racing',
      f009: 'resistance-bands-set',
      f010: 'cap-kettlebell-35',
      f011: 'weider-bench',
      f012: 'nordictrack-treadmill',
      f013: 'ua-training-shorts',
      f014: 'lululemon-align-leggings',
      f015: 'garmin-forerunner-265',
      f016: 'peloton-bike',
      c001: 'coleman-sundome-tent',
      c002: 'coleman-sleeping-bag',
      c003: 'magellan-chairs',
      c004: 'yeti-tundra-45',
      c005: 'coleman-stove',
      c006: 'northbound-backpacking-tent',
      c007: 'thermarest-pad',
      c008: 'coleman-lantern',
      c009: 'yeti-roadie-24',
      c010: 'osprey-atmos-50',
      c011: 'jetboil-flash',
      c012: 'kelty-tarp',
      fi001: 'ugly-stik-rod',
      fi002: 'penn-battle-reel',
      fi003: 'rapala-lures',
      fi004: 'plano-tackle-box',
      fi005: 'berkley-fireline',
      fi006: 'perception-kayak',
      fi007: 'frogg-toggs-waders',
      fi008: 'engel-bait-cooler',
      fi009: 'gloomis-fw-rod',
      fi010: 'frabill-landing-net',
      fi011: 'humminbird-helix-5',
      fi012: 'shimano-stradic-reel',
    };
  }

  // Translate a mock ID like 'h001' into the matching Shopify handle.
  // If the input already looks like a handle (contains dashes, no leading letter+digits pattern),
  // pass it through. Returns null if no mapping exists.
  _resolveHandle(id) {
    if (!id) return null;
    if (this._idToHandle[id]) return this._idToHandle[id];
    // Already a Shopify handle (contains a dash, isn't a mock-style ID)
    if (id.includes('-')) return id;
    return null;
  }

  describe() {
    return {
      name: 'Shopify',
      mode: this.live ? 'LIVE' : 'STUB',
      backend: this.live ? `${this.config.storeDomain}` : 'Mock data (configure SHOPIFY_CONFIG to go live)',
      latency: this.live ? 'Shopify Storefront API' : '~250–350ms',
    };
  }

  // ---- GraphQL helper ------------------------------------------------------
  async _gql(query, variables = {}) {
    if (!this.live) throw new Error('Shopify adapter is in STUB mode');
    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': this.config.storefrontToken,
      },
      body: JSON.stringify({ query, variables }),
    });
    if (!response.ok) {
      throw new Error(`Shopify API error: ${response.status}`);
    }
    const json = await response.json();
    if (json.errors) {
      console.warn('Shopify GraphQL errors:', json.errors);
    }
    return json.data;
  }

  // ---- Mappers -------------------------------------------------------------
  // Shopify product node → our UI product shape.
  _toUIProduct(node) {
    if (!node) return null;
    const variant = node.variants?.edges?.[0]?.node;
    const price = parseFloat(variant?.price?.amount || node.priceRange?.minVariantPrice?.amount || 0);
    const compareAt = variant?.compareAtPrice?.amount ? parseFloat(variant.compareAtPrice.amount) : null;
    // Collect ALL images, not just first
    const allImages = (node.images?.edges || []).map(e => e?.node?.url).filter(Boolean);
    const photo = allImages[0] || null;
    const tags = Array.isArray(node.tags) ? node.tags : [];
    const category = inferShopifyCategory(node.productType, node.title, tags);
    // Try to infer subcategory from tags (we tagged products like "footwear", "soccer", etc. in the CSV)
    const subcategoryHint = tags.find(t => ['footwear', 'soccer', 'baseball', 'basketball', 'crossbows', 'optics', 'apparel', 'shelter', 'coolers', 'rods', 'reels'].includes(t.toLowerCase()));
    return {
      id: node.handle,                         // use handle as stable ID
      sku: variant?.sku || node.handle,
      name: node.title,
      brand: node.vendor || 'Academy',
      category,
      subcategory: subcategoryHint || tags[0] || category,
      price,
      compareAt: compareAt && compareAt > price ? compareAt : null,
      rating: 4.5 + (node.handle.length % 5) / 10,   // Shopify Storefront doesn't expose review data
      reviews: 100 + (node.handle.charCodeAt(0) % 500),
      image: this._categoryEmoji(category),
      photo,
      photos: allImages.length > 0 ? allImages : null,   // multi-image gallery support
      tags,
      spec: {},
      shopifyVariantId: variant?.id,
    };
  }

  _categoryEmoji(category) {
    const map = {
      hunting: '🎯', 'team-sports': '⚽', fitness: '🏃',
      camping: '⛺', fishing: '🎣',
    };
    return map[category] || '🏷️';
  }

  // ---- Interface methods ---------------------------------------------------
  async _allProducts() {
    if (!this.live) {
      // In STUB mode, expose the full mock catalog
      return CATALOG;
    }
    if (this._productCache) return this._productCache;
    const data = await this._gql(`
      query GetAllProducts {
        products(first: 100) {
          edges {
            node {
              handle title vendor productType tags
              priceRange { minVariantPrice { amount currencyCode } }
              images(first: 1) { edges { node { url altText } } }
              variants(first: 1) {
                edges {
                  node {
                    id sku
                    price { amount currencyCode }
                    compareAtPrice { amount currencyCode }
                  }
                }
              }
            }
          }
        }
      }
    `);
    const products = (data?.products?.edges || []).map(e => this._toUIProduct(e.node)).filter(Boolean);
    this._productCache = products;
    return products;
  }

  async getProduct(id) {
    if (!this.live) return new MockAdapter().getProduct(id);
    const handle = this._resolveHandle(id);
    if (!handle) {
      // Unmapped ID — fall back to mock so the UI doesn't break
      return new MockAdapter().getProduct(id);
    }
    const data = await this._gql(`
      query GetProductByHandle($handle: String!) {
        productByHandle(handle: $handle) {
          handle title vendor productType tags descriptionHtml
          priceRange { minVariantPrice { amount currencyCode } }
          images(first: 5) { edges { node { url altText } } }
          variants(first: 1) {
            edges {
              node {
                id sku availableForSale
                price { amount currencyCode }
                compareAtPrice { amount currencyCode }
              }
            }
          }
        }
      }
    `, { handle });
    const product = this._toUIProduct(data?.productByHandle);
    if (!product) {
      // Shopify returned null — fall back to mock so the home page doesn't go empty
      return new MockAdapter().getProduct(id);
    }
    return product;
  }

  async getProducts(filters = {}) {
    const all = await this._allProducts();
    let filtered = all;
    if (filters.category) {
      filtered = filtered.filter(p => p.category === filters.category);
    }
    if (filters.persona) {
      // Personas don't carry over directly to Shopify products; use tags
      filtered = filtered.filter(p => p.tags?.some(t => t.includes(filters.persona)));
    }
    return filtered;
  }

  async getCategory(categoryId) {
    return {
      id: categoryId,
      name: categoryId.charAt(0).toUpperCase() + categoryId.slice(1),
      hero: `Live Shopify catalog — ${categoryId}`,
      facets: [
        { id: 'subcategory', name: 'Type', values: [] },
        { id: 'brand', name: 'Brand', values: [] },
      ],
    };
  }

  async search(query) {
    const all = await this._allProducts();
    const q = query.toLowerCase();
    const matched = all.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.category.includes(q) ||
      p.tags?.some(t => t.toLowerCase().includes(q))
    ).slice(0, 6);
    return {
      results: matched.map(p => ({
        product: p,
        reason: `${p.brand} ${p.name.split(' ').slice(-2).join(' ')} — keyword match in Shopify catalog`,
      })),
    };
  }

  async visualSearch(imageMeta) {
    // Shopify Storefront has no native image search; fall back to category heuristic
    return new MockAdapter().visualSearch(imageMeta);
  }

  async addToCart(items) {
    // Cart is kept browser-side regardless of backend (consistent with mock)
    return {
      success: true,
      lineItems: items,
      total: items.reduce((s, i) => s + (i.product.price * i.qty), 0),
    };
  }

  async getMerchandisingRules() {
    // Shopify Storefront API can't write merch rules — use localStorage
    try {
      const stored = window.localStorage.getItem(this.merchRulesKey);
      if (stored) return JSON.parse(stored);
    } catch (e) { /* ignore */ }
    return new MockAdapter().getMerchandisingRules();   // initial defaults
  }

  async updateMerchandisingRule(id, payload) {
    try {
      const current = (await this.getMerchandisingRules()) || {};
      current[id] = payload;
      window.localStorage.setItem(this.merchRulesKey, JSON.stringify(current));
    } catch (e) { /* ignore */ }
    return { success: true };
  }

  /* ==========================================================================
     CUSTOMER ACCOUNTS — login, profile, order history.
     Uses Shopify Storefront customer access tokens (classic password auth).
     The three demo personas were provisioned with these credentials; the
     storefront logs in on the user's behalf for the one-click persona switch.
     ========================================================================== */

  // Exchange email + password for a customer access token.
  async customerLogin(email, password) {
    if (!this.live) {
      // STUB mode: pretend login succeeds so the persona switch still works offline.
      return { success: true, token: `stub-${email}`, stub: true };
    }
    const data = await this._gql(`
      mutation login($input: CustomerAccessTokenCreateInput!) {
        customerAccessTokenCreate(input: $input) {
          customerAccessToken { accessToken expiresAt }
          customerUserErrors { code message }
        }
      }
    `, { input: { email, password } });
    const result = data?.customerAccessTokenCreate;
    const token = result?.customerAccessToken?.accessToken;
    if (!token) {
      const err = result?.customerUserErrors?.[0]?.message || 'Login failed';
      return { success: false, error: err };
    }
    return {
      success: true,
      token,
      expiresAt: result.customerAccessToken.expiresAt,
    };
  }

  // Fetch the logged-in customer's profile + default address.
  async getCustomer(token) {
    if (!this.live || (token && token.startsWith('stub-'))) {
      return null;   // STUB mode has no live profile
    }
    const data = await this._gql(`
      query getCustomer($token: String!) {
        customer(customerAccessToken: $token) {
          id firstName lastName email phone
          defaultAddress {
            address1 city province provinceCode zip country
          }
          tags
        }
      }
    `, { token });
    const c = data?.customer;
    if (!c) return null;
    return {
      id: c.id,
      firstName: c.firstName,
      lastName: c.lastName,
      email: c.email,
      phone: c.phone,
      tags: c.tags || [],
      address: c.defaultAddress ? {
        line1: c.defaultAddress.address1,
        city: c.defaultAddress.city,
        state: c.defaultAddress.provinceCode || c.defaultAddress.province,
        zip: c.defaultAddress.zip,
        country: c.defaultAddress.country,
      } : null,
    };
  }

  // Fetch the customer's order history. Uses processedAt for the order date
  // (the Storefront API's Order type doesn't expose tags, so we derive
  // "days ago" from the real timestamp).
  async getCustomerOrders(token) {
    if (!this.live || (token && token.startsWith('stub-'))) {
      return [];
    }
    const data = await this._gql(`
      query getOrders($token: String!) {
        customer(customerAccessToken: $token) {
          orders(first: 30, sortKey: PROCESSED_AT, reverse: true) {
            edges {
              node {
                id
                orderNumber
                processedAt
                totalPrice { amount currencyCode }
                lineItems(first: 10) {
                  edges {
                    node {
                      title
                      quantity
                      variant {
                        product { handle productType }
                        image { url }
                        price { amount }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    `, { token });
    const edges = data?.customer?.orders?.edges || [];
    const now = Date.now();
    // The seeded orders were all processed at setup time (same day), and the
    // Storefront API won't expose our placed-NNNd-ago tags. To present a
    // believable history, derive a stable "days ago" from each order's position
    // (most recent order = a few days ago, older orders spread back over months).
    return edges.map(({ node }, idx) => {
      // Spread orders realistically: newest ~4 days ago, each prior order older.
      // Deterministic from index so it's stable across renders.
      const placedDaysAgo = 4 + idx * 17 + (node.orderNumber % 7);
      const apparentDate = new Date(now - placedDaysAgo * 86400000);
      return {
        id: node.id || null,    // GID like gid://shopify/Order/<numeric> — needed for Admin API swap
        orderNumber: node.orderNumber,
        date: apparentDate,
        daysAgo: placedDaysAgo,
        total: parseFloat(node.totalPrice?.amount || 0),
        currency: node.totalPrice?.currencyCode || 'USD',
        items: (node.lineItems?.edges || []).map(e => ({
          title: e.node.title,
          quantity: e.node.quantity,
          handle: e.node.variant?.product?.handle || null,
          category: (e.node.variant?.product?.productType || '').toLowerCase(),
          photo: e.node.variant?.image?.url || null,
          price: parseFloat(e.node.variant?.price?.amount || 0),
        })),
      };
    });
  }

  /* ==========================================================================
     LOCATIONS + INVENTORY — live per-store stock for the delivery promise.
     Note: the Storefront API exposes inventory availability per location only
     in limited ways. We read availableForSale + quantityAvailable on variants,
     and surface the four store locations for the "in stock at X" feature.
     ========================================================================== */

  // The four physical stores (mirrors what setup-shopify provisioned).
  // Storefront API doesn't list arbitrary locations, so we keep this curated.
  async getLocations() {
    return [
      { id: 'shop',    name: 'Shop location',     city: 'Online',  zip: null },
      { id: 'houston', name: 'Houston Memorial',  city: 'Houston', zip: '77024' },
      { id: 'cypress', name: 'Cypress',           city: 'Cypress', zip: '77433' },
      { id: 'plano',   name: 'Plano',             city: 'Plano',   zip: '75024' },
    ];
  }

  // Per-variant availability. The Storefront API gives a single rolled-up
  // quantityAvailable across locations (not per-location without the
  // @inContext directive + published inventory). For the demo we return the
  // aggregate availableForSale + quantityAvailable, and synthesize a plausible
  // per-location split deterministically so the "in stock at Cypress" claim is
  // stable across renders. (Real per-location requires Admin API, which is
  // plan-gated here.)
  async getInventoryByLocation(id) {
    const handle = this._resolveHandle(id);
    if (!this.live || !handle) {
      // STUB / unmapped — synthesize from mock so the UI still renders.
      return this._syntheticInventory(handle || id, 40);
    }
    const data = await this._gql(`
      query getInv($handle: String!) {
        productByHandle(handle: $handle) {
          handle
          variants(first: 1) {
            edges {
              node {
                availableForSale
                quantityAvailable
              }
            }
          }
        }
      }
    `, { handle });
    const v = data?.productByHandle?.variants?.edges?.[0]?.node;
    const total = (v && typeof v.quantityAvailable === 'number') ? v.quantityAvailable : 0;
    const split = this._syntheticInventory(handle, total);
    split.availableForSale = v?.availableForSale ?? (total > 0);
    return split;
  }

  // Deterministic per-location split from a total + handle seed, so the demo
  // shows stable, believable stock numbers per store.
  _syntheticInventory(seed, total) {
    const hash = (s) => { let h = 0; for (let i = 0; i < (s || '').length; i++) h = ((h << 5) - h) + s.charCodeAt(i); return Math.abs(h); };
    const base = hash(seed || 'x');
    const present = (salt, pct) => (hash((seed || '') + salt) % 100) < pct;
    const rng = (salt, lo, hi) => lo + (hash((seed || '') + salt) % (hi - lo + 1));
    const locations = [];
    // Online / Shop location always stocked
    locations.push({ id: 'shop', name: 'Shop location', city: 'Online', qty: Math.max(5, Math.round(total * 0.5)) || rng('shop', 30, 100) });
    if (present('hou', 60)) locations.push({ id: 'houston', name: 'Houston Memorial', city: 'Houston', qty: rng('hou', 8, 20) });
    if (present('cyp', 50)) locations.push({ id: 'cypress', name: 'Cypress', city: 'Cypress', qty: rng('cyp', 5, 15) });
    if (present('pla', 70)) locations.push({ id: 'plano', name: 'Plano', city: 'Plano', qty: rng('pla', 6, 18) });
    return {
      handle: seed,
      total: total || locations.reduce((s, l) => s + l.qty, 0),
      availableForSale: true,
      locations,
    };
  }
}

/* ----------------------------------------------------------------------------
   Adapter registry — supports runtime swapping from the admin panel.
   ---------------------------------------------------------------------------- */
const ADAPTERS = {
  mock: new MockAdapter(),
  commercetools: new CommercetoolsAdapter(),
  shopify: new ShopifyAdapter(SHOPIFY_CONFIG),
};

// Mutable singleton. Components read via the AdapterContext below.
let adapter = ADAPTERS.shopify;   // DEMO DEFAULT: start on live Shopify (was ADAPTERS.mock)
const ADAPTER_DESCRIBE = {
  mock: { name: 'MockAdapter', mode: 'DEMO', backend: 'In-memory catalog', latency: '~250–350ms' },
  commercetools: ADAPTERS.commercetools.describe(),
  shopify: ADAPTERS.shopify.describe(),
};

/* ============================================================================
   PERSONA + APP CONTEXT
   ============================================================================ */
const PERSONAS = {
  hunter: { id: 'hunter', name: 'Jake', sub: 'Hunter · Texas', icon: '🦌', accent: '#8B4513', desc: 'Pre-deer-season intent. Past purchases: scope, blind, camo.', shopify: { email: 'anant.jadon25+jake@gmail.com', password: 'DemoPass123!' } },
  parent: { id: 'parent', name: 'Maria', sub: 'Parent · Two kids', icon: '⚽', accent: '#1e6f5c', desc: 'Browses team sports. Kids ages 9 and 12.', shopify: { email: 'coforgeadobe@gmail.com', password: 'DemoPass123!' } },
  fitness: { id: 'fitness', name: 'Alex', sub: 'Fitness · Deal-led', icon: '🏃', accent: '#c5523e', desc: 'Price-sensitive. Frequent fitness/apparel browse.', shopify: { email: 'anant.2.singh@coforge.com', password: 'DemoPass123!' } },
  // Anonymous fallback. Persona-keyed lookups in components default to this when
  // user.persona is null. Distinct from a real persona — neutral, no signal.
  guest: { id: 'guest', name: 'Guest', sub: 'Browsing anonymously', icon: '👋', accent: '#94a3b8', desc: 'No signal yet. Sign in for personalized recommendations.' },
};

// Resolve a persona-keyed lookup safely. When persona is null (anonymous), all
// lookups fall back to 'guest'. Components should ALWAYS use this instead of
// dereferencing PERSONAS[persona] directly — that throws on null.
const personaKey = (p) => p && PERSONAS[p] ? p : 'guest';

// Canonical category list used by the top nav, Merch Tool, and PDP breadcrumb.
// Adding a new category here automatically surfaces it everywhere.
const CATEGORY_LIST = [
  { id: 'hunting',     label: 'Hunting',     icon: '🎯' },
  { id: 'team-sports', label: 'Team Sports', icon: '⚽' },
  { id: 'fitness',     label: 'Fitness',     icon: '🏃' },
  { id: 'camping',     label: 'Camping',     icon: '⛺' },
  { id: 'fishing',     label: 'Fishing',     icon: '🎣' },
];

const AppCtx = createContext(null);
const useApp = () => useContext(AppCtx);

// =============================================================================
//   VOICE INPUT — MediaRecorder + Deepgram-via-Worker (server-side transcription)
//   ---------------------------------------------------------------------------
//   Architecture: Browser records audio via MediaRecorder → blob uploaded to our
//   Cloudflare Worker → Worker forwards to Deepgram with the DEEPGRAM_API_KEY
//   secret → transcript returns. The Deepgram API key never reaches the browser.
//
//   Why not the browser's native SpeechRecognition?
//   That API sends audio to Google/Apple/Microsoft cloud services. Many corporate
//   networks block those endpoints (we hit this exact issue at IN-MAC-131317 — the
//   `network` errors meant Chrome couldn't reach Google's speech-api). Deepgram
//   via our own worker proxy gives us a single endpoint to whitelist and full
//   control over the transcription pipeline.
//
//   Browser support for MediaRecorder is universal in modern browsers (Chrome,
//   Edge, Safari 14.1+, Firefox). No webkitMediaRecorder fallback needed.
// =============================================================================

// Pick the best audio format this browser supports for MediaRecorder.
// Deepgram accepts all of these — webm/opus is highest quality and smallest.
const pickAudioMimeType = () => {
  if (typeof MediaRecorder === 'undefined') return null;
  const candidates = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/mp4',         // Safari preferred
    'audio/ogg;codecs=opus',
    'audio/ogg',
  ];
  for (const t of candidates) {
    if (MediaRecorder.isTypeSupported(t)) return t;
  }
  return '';   // empty string lets MediaRecorder pick its default
};

// Hook: records mic audio, sends to our worker /v1/transcribe, returns the text.
// Same return shape as the previous SpeechRecognition hook so callers don't change.
//   { supported, listening, transcribing, error, start, stop, reset, interim }
// - listening    : mic is actively recording
// - transcribing : recording finished, upload+API call in flight
// - interim      : always empty string (no live transcript in batch mode — kept
//                  for API compatibility with the old hook)
const useDeepgramRecording = ({ onResult } = {}) => {
  const supported = typeof MediaRecorder !== 'undefined' && typeof navigator !== 'undefined' && Boolean(navigator?.mediaDevices?.getUserMedia);

  const [listening, setListening] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [error, setError] = useState(null);

  const mediaStreamRef = useRef(null);
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const onResultRef = useRef(onResult);

  // Keep the latest onResult callback accessible without recreating the recorder
  useEffect(() => { onResultRef.current = onResult; }, [onResult]);

  // Cleanup on unmount — stop any active recording and release the mic stream
  useEffect(() => () => {
    try { recorderRef.current?.stop(); } catch (e) { /* ignore */ }
    try { mediaStreamRef.current?.getTracks().forEach(t => t.stop()); } catch (e) { /* ignore */ }
    recorderRef.current = null;
    mediaStreamRef.current = null;
  }, []);

  // Upload the recorded audio blob to our worker, which forwards to Deepgram
  const uploadAndTranscribe = useCallback(async (audioBlob, mimeType) => {
    const proxyUrl = LLM_CONFIG.proxyUrl;
    if (!proxyUrl) {
      throw new Error('Voice transcription requires the worker proxy. Set VITE_LLM_PROXY_URL.');
    }
    // Trim trailing slash so we can concatenate the path cleanly
    const base = proxyUrl.replace(/\/$/, '');
    const url = `${base}/v1/transcribe`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': mimeType || 'audio/webm' },
      body: audioBlob,
    });
    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new Error(`Transcription failed (${response.status}): ${text || response.statusText}`);
    }
    const data = await response.json();
    return data?.transcript || '';
  }, []);

  const start = useCallback(async () => {
    if (!supported) {
      setError('Voice input requires a modern browser with microphone support.');
      return;
    }
    if (listening || transcribing) return;
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      const mimeType = pickAudioMimeType();
      // MediaRecorder constructor with the picked mime type. Some browsers
      // require the options arg to be omitted entirely if mimeType is empty.
      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onerror = (e) => {
        setError(`Recording error: ${e?.error?.message || 'unknown'}`);
        setListening(false);
      };

      recorder.onstop = async () => {
        // Always release the mic — stops the browser tab indicator
        try { mediaStreamRef.current?.getTracks().forEach(t => t.stop()); } catch (e) { /* ignore */ }
        mediaStreamRef.current = null;
        setListening(false);

        const chunks = chunksRef.current;
        chunksRef.current = [];
        if (!chunks.length) {
          // Nothing recorded (user clicked stop too fast or mic produced no audio)
          return;
        }
        const blob = new Blob(chunks, { type: recorder.mimeType || mimeType || 'audio/webm' });
        // Guard: blobs under ~1kB are basically empty, don't waste an API call
        if (blob.size < 1024) {
          setError('Recording was too short. Please try again.');
          return;
        }

        setTranscribing(true);
        try {
          const transcript = await uploadAndTranscribe(blob, recorder.mimeType || mimeType);
          if (transcript && onResultRef.current) {
            onResultRef.current(transcript);
          } else if (!transcript) {
            setError('No speech detected. Try again, louder.');
          }
        } catch (err) {
          setError(err?.message || 'Transcription failed.');
        } finally {
          setTranscribing(false);
        }
      };

      recorder.onstart = () => setListening(true);

      recorderRef.current = recorder;
      // Collect data in 100ms chunks. Final blob is assembled in onstop.
      // The interval doesn't affect quality, just resilience to long pauses.
      recorder.start(100);
    } catch (err) {
      // Most common: user denied mic permission
      const msg = err?.name === 'NotAllowedError'
        ? 'Microphone permission denied. Allow it in your browser settings.'
        : err?.name === 'NotFoundError'
          ? 'No microphone detected on this device.'
          : `Could not start recording: ${err?.message || 'unknown error'}`;
      setError(msg);
      setListening(false);
      // Clean up partial state
      try { mediaStreamRef.current?.getTracks().forEach(t => t.stop()); } catch (e) { /* ignore */ }
      mediaStreamRef.current = null;
    }
  }, [supported, listening, transcribing, uploadAndTranscribe]);

  const stop = useCallback(() => {
    try { recorderRef.current?.stop(); } catch (e) { /* ignore */ }
  }, []);

  const reset = useCallback(() => { setError(null); }, []);

  // Compatibility: old hook returned `interim` for live partial transcripts.
  // Batch mode has no interim, so always empty. Kept so the button doesn't break.
  return { supported, listening, transcribing, interim: '', error, start, stop, reset };
};

// Reusable mic button — click to start recording, click again to stop and transcribe.
// Three visual states:
//   1. Idle    — gray mic icon
//   2. Listening (red, pulsing) — actively recording
//   3. Transcribing (amber spinner) — uploading + waiting for Deepgram
// Reusable mic button — click to start recording, click again to stop and transcribe.
// Three visual states:
//   1. Idle    — gray mic icon
//   2. Listening (red, pulsing) — actively recording
//   3. Transcribing (amber spinner) — uploading + waiting for Deepgram
//
// Optional auto-submit: pass `onAutoSubmit(finalText)` and the button will
// invoke it AFTER the transcript is in setValue's state. Use for chat-style
// surfaces where speaking-then-sending is the natural flow. Don't pass for
// surfaces where the user should review before committing (Kit Builder,
// banner editor, etc).
const VoiceMicButton = ({ value, setValue, disabled = false, size = 36, title, onAutoSubmit }) => {
  // Capture the latest auto-submit handler in a ref so the onResult closure
  // doesn't go stale on parent re-renders (the chat input rerenders constantly
  // as the user types).
  const onAutoSubmitRef = useRef(onAutoSubmit);
  useEffect(() => { onAutoSubmitRef.current = onAutoSubmit; }, [onAutoSubmit]);

  const onResult = useCallback((finalText) => {
    if (!finalText) return;
    let mergedText = '';
    setValue(curr => {
      const prev = (typeof curr === 'string' ? curr : value) || '';
      const trimmedPrev = prev.trim();
      mergedText = trimmedPrev ? `${trimmedPrev} ${finalText}` : finalText;
      return mergedText;
    });
    // Auto-submit fires after React flushes the setValue. We pass the merged
    // text directly so the submit handler doesn't have to read from state
    // (which would race the setValue commit).
    if (onAutoSubmitRef.current && mergedText) {
      // Defer one tick so the input field visibly shows the text before the
      // submit fires — feels more natural on stage ("I see what I said, then
      // it sends") and gives React a chance to commit the state update.
      setTimeout(() => {
        if (onAutoSubmitRef.current) onAutoSubmitRef.current(mergedText);
      }, 50);
    }
  }, [setValue, value]);

  const { supported, listening, transcribing, error, start, stop } = useDeepgramRecording({ onResult });

  // Hide entirely if browser lacks MediaRecorder support (very old browsers).
  if (!supported) return null;

  // 60-second safety cap — auto-stops recording if the user forgets to click off
  const autoStopTimer = useRef(null);
  useEffect(() => {
    if (autoStopTimer.current) clearTimeout(autoStopTimer.current);
    if (listening) {
      autoStopTimer.current = setTimeout(() => {
        try { stop(); } catch (e) {}
      }, 60_000);
    }
    return () => {
      if (autoStopTimer.current) clearTimeout(autoStopTimer.current);
    };
  }, [listening, stop]);

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled || transcribing) return;   // can't start a new one while transcribing
    if (listening) stop();
    else start();
  };

  const handleKeyDown = (e) => {
    if (disabled || transcribing) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (listening) stop();
      else start();
    }
  };

  // Tooltip reflects current state
  const tooltip = error
    ? error
    : transcribing
      ? 'Transcribing…'
      : listening
        ? 'Recording — click to stop'
        : (title || 'Click to speak');

  // Icon color/border by state
  const stateColor =
    error        ? T.amber :
    transcribing ? T.violet :
    listening    ? T.red :
                   T.text2;
  const stateBg =
    transcribing ? 'rgba(25,70,200,0.18)' :
    listening    ? 'rgba(255,77,77,0.22)' :
                   'rgba(15,23,42,0.06)';

  return (
    <button
      type="button"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      disabled={disabled || transcribing}
      title={tooltip}
      aria-label={listening ? 'Stop recording' : transcribing ? 'Transcribing' : 'Start voice input'}
      style={{
        background: stateBg,
        border: (listening || transcribing) ? `1px solid ${stateColor}` : `1px solid transparent`,
        color: stateColor,
        width: size, height: size, borderRadius: '50%',
        cursor: (disabled || transcribing) ? 'wait' : 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative',
        transition: 'background-color 0.15s, border-color 0.15s, color 0.15s',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        WebkitTouchCallout: 'none',
        WebkitTapHighlightColor: 'transparent',
        touchAction: 'manipulation',
      }}
    >
      {transcribing
        ? <Loader2 size={Math.round(size * 0.45)} className="spin" />
        : listening
          ? <Mic size={Math.round(size * 0.45)} className="pulse-soft" />
          : error
            ? <MicOff size={Math.round(size * 0.45)} />
            : <Mic size={Math.round(size * 0.45)} />}
      {listening && (
        <span
          style={{
            position: 'absolute', inset: -3,
            borderRadius: '50%',
            border: `1px solid ${T.red}`,
            opacity: 0.6,
            animation: 'voice-ring 1.2s ease-in-out infinite',
            pointerEvents: 'none',
          }}
        />
      )}
    </button>
  );
};


/* ============================================================================
   DESIGN TOKENS
   ============================================================================ */
const T = {
  // Base canvas — academy.com aesthetic: white + soft grays
  void: '#ffffff',
  ink: '#fafafa',
  ink2: '#f4f4f5',
  ink3: '#e4e4e7',

  // Glass tones — semi-opaque white over the light canvas
  glassSurface: 'rgba(255,255,255,0.75)',
  glassSurfaceHi: 'rgba(255,255,255,0.92)',
  glassBorder: 'rgba(15,23,42,0.10)',
  glassBorderHi: 'rgba(15,23,42,0.18)',

  hairline: 'rgba(15,23,42,0.10)',
  hairlineStrong: 'rgba(15,23,42,0.18)',

  // Text — near-black on white, soft grays for hierarchy
  text: '#0f172a',
  text2: '#475569',
  text3: '#94a3b8',
  text4: '#cbd5e1',

  // Accent palette — United States flag: navy + Academy blue + flag red, on white
  violet: '#1946c8',     // Academy blue — primary brand / CTA
  violetDeep: '#002868', // flag navy — deep brand, headers, footer
  pink: '#c8102e',       // flag red — sale, emphasis, accents
  pinkDeep: '#9b0c22',
  cyan: '#2563eb',        // medium blue — AI assistant accent (kept in blue family)
  cyanDeep: '#1d4ed8',
  amber: '#c8102e',      // (was warm) → flag red so eyebrow labels read red-white-blue
  amberDeep: '#9b0c22',
  lime: '#16a34a',       // green retained for in-stock / success badges (matches Academy)
  red: '#c8102e',
  redDeep: '#9b0c22',
  green: '#16a34a',

  // Illustration linework — flipped: dark linework on light surfaces
  bone: '#0f172a',
  boneDim: '#475569',

  // Backwards-compat (alias to light surfaces)
  paper: '#ffffff',
  rule: '#e4e4e7',
  ruleLight: 'rgba(15,23,42,0.06)',
  forest: '#15803d',

  // Signature gradients — Academy blue-led
  gradHero: 'linear-gradient(120deg, #002868 0%, #1946c8 50%, #c8102e 100%)',
  gradAI: 'linear-gradient(135deg, #2563eb 0%, #1946c8 100%)',
  gradAmber: 'linear-gradient(135deg, #c8102e 0%, #9b0c22 100%)',
  gradCool: 'linear-gradient(135deg, #2563eb 0%, #1946c8 100%)',

  display: '"Fraunces", "Playfair Display", Georgia, serif',
  sans: '"Inter Tight", "Helvetica Neue", system-ui, sans-serif',
  mono: '"JetBrains Mono", ui-monospace, monospace',
};

const GlobalStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700;9..144,800&family=Inter+Tight:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
    * { box-sizing: border-box; }
    body { margin: 0; background: ${T.void}; }
    .aso-root {
      font-family: ${T.sans};
      color: ${T.text};
      background: ${T.void};
      min-height: 100vh;
      -webkit-font-smoothing: antialiased;
      position: relative;
      overflow-x: hidden;
    }
    /* Subtle mesh backdrop tuned for white canvas */
    .aso-root::before {
      content: '';
      position: fixed; inset: 0; pointer-events: none; z-index: 0;
      background:
        radial-gradient(ellipse 80% 60% at 10% 0%, rgba(25,70,200,0.07) 0%, transparent 55%),
        radial-gradient(ellipse 70% 50% at 90% 30%, rgba(200,16,46,0.05) 0%, transparent 55%),
        radial-gradient(ellipse 60% 50% at 50% 100%, rgba(0,40,104,0.05) 0%, transparent 60%),
        radial-gradient(ellipse 70% 60% at 100% 100%, rgba(200,16,46,0.04) 0%, transparent 55%);
      animation: mesh-drift 24s ease-in-out infinite alternate;
    }
    @keyframes mesh-drift {
      0%   { transform: translate(0%, 0%) scale(1); }
      50%  { transform: translate(2%, -1%) scale(1.05); }
      100% { transform: translate(-1%, 1%) scale(1); }
    }
    .aso-root > * { position: relative; z-index: 1; }
    .aso-root *::selection { background: ${T.pink}; color: white; }
    .display { font-family: ${T.display}; font-weight: 600; letter-spacing: -0.02em; line-height: 0.95; }
    .mono { font-family: ${T.mono}; font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; }

    /* Glass surfaces */
    .glass {
      background: ${T.glassSurface};
      backdrop-filter: blur(24px) saturate(180%);
      -webkit-backdrop-filter: blur(24px) saturate(180%);
      border: 1px solid ${T.glassBorder};
    }
    .glass-card {
      background: linear-gradient(135deg, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.78) 100%);
      backdrop-filter: blur(20px) saturate(160%);
      -webkit-backdrop-filter: blur(20px) saturate(160%);
      border: 1px solid ${T.glassBorder};
      box-shadow: 0 4px 16px rgba(15,23,42,0.06), 0 1px 2px rgba(15,23,42,0.04);
    }

    .grain {
      background-image:
        radial-gradient(circle at 20% 30%, rgba(15,23,42,0.03) 1px, transparent 1px),
        radial-gradient(circle at 70% 60%, rgba(15,23,42,0.02) 1px, transparent 1px);
      background-size: 3px 3px, 5px 5px;
    }
    .grid-bg {
      background-image:
        linear-gradient(rgba(15,23,42,0.04) 1px, transparent 1px),
        linear-gradient(90deg, rgba(15,23,42,0.04) 1px, transparent 1px);
      background-size: 48px 48px;
    }

    .scroll-x::-webkit-scrollbar { display: none; }
    .scroll-x { scrollbar-width: none; }

    @keyframes pulse-soft { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
    .pulse-soft { animation: pulse-soft 1.5s ease-in-out infinite; }
    @keyframes thinking-dots { 0%, 20% { opacity: 0.2; } 50% { opacity: 1; } 80%, 100% { opacity: 0.2; } }
    .think-dot { animation: thinking-dots 1.2s ease-in-out infinite; }
    .think-dot:nth-child(2) { animation-delay: 0.2s; }
    .think-dot:nth-child(3) { animation-delay: 0.4s; }

    /* Pulsing ring around the voice mic button while listening */
    @keyframes voice-ring {
      0% { transform: scale(1); opacity: 0.6; }
      50% { transform: scale(1.15); opacity: 0.2; }
      100% { transform: scale(1); opacity: 0.6; }
    }
    /* Spinner for the transcribing state (Loader2 icon) */
    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    .spin { animation: spin 1s linear infinite; }

    /* Orb breathing */
    @keyframes orb-breathe {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }
    .orb-breathe { animation: orb-breathe 4s ease-in-out infinite; }

    /* Orb gradient swirl (inner element) */
    @keyframes orb-swirl { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    .orb-swirl { animation: orb-swirl 12s linear infinite; }

    /* Shimmer on key text */
    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
    .shimmer-text {
      background: linear-gradient(90deg, ${T.text2} 0%, ${T.violet} 40%, ${T.pink} 60%, ${T.text2} 100%);
      background-size: 200% 100%;
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
      animation: shimmer 3s linear infinite;
    }

    button { font-family: inherit; }
    input, textarea { font-family: inherit; color: ${T.text}; }
  `}</style>
);

/* ============================================================================
   PRODUCT ILLUSTRATION SYSTEM
   Hand-built SVGs per subcategory. Two-tone editorial style:
   ink linework on a warm paper base, occasional amber accent.
   Each illustration uses viewBox 0 0 200 200, scales fluidly to container.
   ============================================================================ */

const ILLUSTRATIONS = {
  // ---- HUNTING -----------------------------------------------------------
  optics: (
    <g>
      {/* Rifle scope: tube body, eyepiece, objective, turret, mount rings */}
      <rect x="40" y="92" width="120" height="22" rx="4" fill={T.bone} />
      <rect x="32" y="86" width="14" height="34" rx="2" fill={T.bone} />
      <rect x="154" y="86" width="14" height="34" rx="2" fill={T.bone} />
      <circle cx="39" cy="103" r="8" fill={T.bone} />
      <circle cx="161" cy="103" r="9" fill={T.amber} />
      <circle cx="161" cy="103" r="5" fill={T.bone} />
      <rect x="92" y="74" width="16" height="20" rx="2" fill={T.bone} />
      <circle cx="100" cy="78" r="3" fill={T.amber} />
      <rect x="60" y="118" width="10" height="10" fill={T.bone} opacity="0.7" />
      <rect x="130" y="118" width="10" height="10" fill={T.bone} opacity="0.7" />
      {/* crosshairs hint inside eyepiece */}
      <line x1="33" y1="103" x2="45" y2="103" stroke={T.amber} strokeWidth="0.8" />
      <line x1="39" y1="97" x2="39" y2="109" stroke={T.amber} strokeWidth="0.8" />
    </g>
  ),
  blinds: (
    <g>
      {/* Ground blind: dome tent shape with window and camo dabs */}
      <path d="M 30 150 Q 100 50 170 150 Z" fill={T.bone} />
      <rect x="80" y="100" width="40" height="30" rx="4" fill={T.bone} />
      <line x1="100" y1="100" x2="100" y2="130" stroke={T.bone} strokeWidth="1.5" />
      <line x1="80" y1="115" x2="120" y2="115" stroke={T.bone} strokeWidth="1.5" />
      {/* Camo speckle */}
      <circle cx="60" cy="130" r="4" fill={T.amber} opacity="0.5" />
      <circle cx="140" cy="120" r="3" fill={T.amber} opacity="0.5" />
      <circle cx="135" cy="140" r="5" fill={T.bone} opacity="0.4" />
      <circle cx="70" cy="105" r="3" fill={T.bone} opacity="0.4" />
      <circle cx="150" cy="100" r="4" fill={T.bone} opacity="0.4" />
      <line x1="30" y1="150" x2="170" y2="150" stroke={T.bone} strokeWidth="2.5" />
    </g>
  ),
  crossbows: (
    <g>
      {/* Crossbow: horizontal stock with limbs and bowstring */}
      <rect x="80" y="92" width="80" height="14" rx="2" fill={T.bone} />
      <path d="M 80 99 L 30 70 L 35 99 L 30 128 Z" fill={T.bone} />
      <path d="M 160 99 L 170 70 L 165 99 L 170 128 Z" fill={T.bone} />
      <line x1="33" y1="76" x2="167" y2="76" stroke={T.bone} strokeWidth="1" />
      <line x1="33" y1="122" x2="167" y2="122" stroke={T.bone} strokeWidth="1" />
      {/* Bolt loaded */}
      <line x1="100" y1="99" x2="175" y2="99" stroke={T.amber} strokeWidth="2" />
      <polygon points="175,99 170,96 170,102" fill={T.amber} />
      {/* Stock detail */}
      <path d="M 105 106 L 110 122 L 125 122 L 120 106 Z" fill={T.bone} />
      <rect x="135" y="86" width="6" height="6" fill={T.amber} />
    </g>
  ),
  apparel: (
    <g>
      {/* Jacket / camo top: hoodie silhouette with camo speckle */}
      <path d="M 70 60 Q 100 50 130 60 L 145 80 L 160 130 L 155 160 L 45 160 L 40 130 L 55 80 Z" fill={T.bone} />
      <path d="M 88 60 Q 100 75 112 60" fill="none" stroke={T.bone} strokeWidth="2" />
      <line x1="100" y1="75" x2="100" y2="155" stroke={T.bone} strokeWidth="1" strokeDasharray="3,3" />
      {/* Camo dabs */}
      <ellipse cx="70" cy="100" rx="5" ry="3" fill={T.amber} opacity="0.4" transform="rotate(-20 70 100)" />
      <ellipse cx="130" cy="120" rx="6" ry="3" fill={T.amber} opacity="0.4" transform="rotate(15 130 120)" />
      <ellipse cx="110" cy="140" rx="4" ry="3" fill={T.bone} opacity="0.3" />
      <ellipse cx="85" cy="130" rx="5" ry="3" fill={T.bone} opacity="0.3" />
      <ellipse cx="115" cy="85" rx="4" ry="3" fill={T.amber} opacity="0.4" />
    </g>
  ),
  calls: (
    <g>
      {/* Game call: tapered horn shape */}
      <path d="M 60 90 L 130 80 L 160 100 L 130 120 L 60 110 Z" fill={T.bone} />
      <ellipse cx="60" cy="100" rx="6" ry="12" fill={T.amber} />
      <ellipse cx="60" cy="100" rx="3" ry="7" fill={T.bone} />
      <line x1="80" y1="92" x2="80" y2="108" stroke={T.bone} strokeWidth="1" opacity="0.5" />
      <line x1="100" y1="88" x2="100" y2="112" stroke={T.bone} strokeWidth="1" opacity="0.5" />
      <line x1="120" y1="85" x2="120" y2="115" stroke={T.bone} strokeWidth="1" opacity="0.5" />
      {/* Lanyard */}
      <path d="M 140 95 Q 155 60 140 50 Q 125 60 140 70" fill="none" stroke={T.bone} strokeWidth="1.5" />
      <circle cx="140" cy="50" r="3" fill={T.amber} />
    </g>
  ),
  footwear: (
    <g>
      {/* Boot/shoe: side profile with sole and lacing */}
      <path d="M 30 130 L 30 100 Q 30 80 50 75 L 90 70 Q 130 70 145 90 L 165 110 L 170 130 Z" fill={T.bone} />
      <rect x="28" y="130" width="144" height="14" rx="3" fill={T.bone} />
      <line x1="28" y1="138" x2="172" y2="138" stroke={T.bone} strokeWidth="0.8" opacity="0.4" />
      {/* Lace eyelets */}
      <circle cx="62" cy="92" r="2" fill={T.amber} />
      <circle cx="76" cy="86" r="2" fill={T.amber} />
      <circle cx="90" cy="82" r="2" fill={T.amber} />
      <circle cx="104" cy="80" r="2" fill={T.amber} />
      {/* Laces */}
      <path d="M 62 92 L 90 82 M 76 86 L 104 80 M 62 92 L 76 86 M 90 82 L 104 80" stroke={T.bone} strokeWidth="1" fill="none" />
      {/* Tread blocks */}
      <rect x="40" y="142" width="8" height="6" fill={T.bone} opacity="0.3" />
      <rect x="60" y="142" width="8" height="6" fill={T.bone} opacity="0.3" />
      <rect x="80" y="142" width="8" height="6" fill={T.bone} opacity="0.3" />
      <rect x="100" y="142" width="8" height="6" fill={T.bone} opacity="0.3" />
      <rect x="120" y="142" width="8" height="6" fill={T.bone} opacity="0.3" />
      <rect x="140" y="142" width="8" height="6" fill={T.bone} opacity="0.3" />
    </g>
  ),
  stands: (
    <g>
      {/* Tree stand: tree trunk + platform */}
      <rect x="92" y="30" width="16" height="160" fill={T.bone} />
      <ellipse cx="100" cy="32" rx="22" ry="10" fill={T.bone} />
      <ellipse cx="100" cy="50" rx="18" ry="8" fill={T.bone} opacity="0.7" />
      {/* Platform */}
      <rect x="108" y="100" width="60" height="6" fill={T.amber} />
      <rect x="108" y="106" width="6" height="40" fill={T.bone} />
      <rect x="162" y="106" width="6" height="40" fill={T.bone} />
      {/* Ladder steps */}
      <line x1="111" y1="115" x2="167" y2="115" stroke={T.bone} strokeWidth="2" />
      <line x1="111" y1="128" x2="167" y2="128" stroke={T.bone} strokeWidth="2" />
      {/* Safety rail */}
      <path d="M 108 100 L 108 80 L 168 80 L 168 100" fill="none" stroke={T.bone} strokeWidth="2" />
    </g>
  ),
  // ---- SOCCER / TEAM SPORTS ----------------------------------------------
  soccer: (
    <g>
      {/* Soccer cleat: side profile, pointed toe, studs */}
      <path d="M 30 120 L 35 100 Q 50 85 80 82 L 130 80 Q 160 82 170 100 L 168 120 Z" fill={T.bone} />
      <path d="M 35 120 L 168 120 L 168 132 Q 100 138 35 132 Z" fill={T.bone} />
      {/* Studs */}
      <circle cx="50" cy="138" r="3" fill={T.amber} />
      <circle cx="75" cy="140" r="3" fill={T.amber} />
      <circle cx="100" cy="140" r="3" fill={T.amber} />
      <circle cx="125" cy="140" r="3" fill={T.amber} />
      <circle cx="150" cy="138" r="3" fill={T.amber} />
      {/* Swoosh-ish stripe */}
      <path d="M 50 100 Q 80 92 130 96 Q 150 100 165 105" fill="none" stroke={T.bone} strokeWidth="3" strokeLinecap="round" />
      {/* Laces */}
      <line x1="70" y1="90" x2="80" y2="100" stroke={T.bone} strokeWidth="1.5" />
      <line x1="85" y1="88" x2="95" y2="98" stroke={T.bone} strokeWidth="1.5" />
      <line x1="100" y1="86" x2="110" y2="96" stroke={T.bone} strokeWidth="1.5" />
    </g>
  ),
  ball: (
    <g>
      {/* Soccer ball: pentagons + hexagons */}
      <circle cx="100" cy="100" r="60" fill={T.bone} />
      <polygon points="100,75 117,87 110,107 90,107 83,87" fill={T.bone} />
      <polygon points="100,75 117,87 130,82 132,65 115,58" fill={T.bone} stroke={T.bone} strokeWidth="1.5" />
      <polygon points="100,75 83,87 70,82 68,65 85,58" fill={T.bone} stroke={T.bone} strokeWidth="1.5" />
      <polygon points="90,107 110,107 118,125 100,138 82,125" fill={T.bone} stroke={T.bone} strokeWidth="1.5" />
      <polygon points="117,87 110,107 130,118 145,105 130,82" fill={T.bone} stroke={T.bone} strokeWidth="1.5" />
      <polygon points="83,87 90,107 70,118 55,105 70,82" fill={T.bone} stroke={T.bone} strokeWidth="1.5" />
      <circle cx="100" cy="100" r="60" fill="none" stroke={T.amber} strokeWidth="1.5" opacity="0.6" />
    </g>
  ),
  shinguard: (
    <g>
      {/* Shin guard: curved shield shape */}
      <path d="M 75 40 L 125 40 Q 145 50 145 90 L 140 150 Q 130 165 100 165 Q 70 165 60 150 L 55 90 Q 55 50 75 40 Z" fill={T.bone} />
      <path d="M 80 50 Q 100 45 120 50 L 130 90 L 125 140 Q 100 150 75 140 L 70 90 Z" fill={T.bone} opacity="0.15" />
      <line x1="100" y1="55" x2="100" y2="155" stroke={T.amber} strokeWidth="2" />
      <circle cx="100" cy="75" r="5" fill={T.amber} />
      <circle cx="100" cy="75" r="2" fill={T.bone} />
      {/* Straps */}
      <rect x="58" y="100" width="10" height="6" fill={T.amber} />
      <rect x="132" y="100" width="10" height="6" fill={T.amber} />
    </g>
  ),
  socks: (
    <g>
      {/* Pair of athletic socks */}
      <path d="M 50 50 L 80 50 L 80 130 L 95 145 L 95 165 L 50 165 L 50 145 L 50 130 Z" fill={T.bone} />
      <path d="M 120 50 L 150 50 L 150 130 L 150 145 L 150 165 L 105 165 L 105 145 L 120 130 Z" fill={T.bone} />
      {/* Top stripes */}
      <rect x="50" y="58" width="30" height="3" fill={T.amber} />
      <rect x="50" y="66" width="30" height="3" fill={T.amber} />
      <rect x="120" y="58" width="30" height="3" fill={T.amber} />
      <rect x="120" y="66" width="30" height="3" fill={T.amber} />
      {/* Heel curves */}
      <path d="M 50 130 Q 65 138 80 130" fill={T.bone} opacity="0.15" />
      <path d="M 120 130 Q 135 138 150 130" fill={T.bone} opacity="0.15" />
    </g>
  ),
  bag: (
    <g>
      {/* Duffel bag with handles */}
      <rect x="30" y="80" width="140" height="80" rx="20" fill={T.bone} />
      <path d="M 60 80 L 60 60 Q 60 50 70 50 L 130 50 Q 140 50 140 60 L 140 80" fill="none" stroke={T.bone} strokeWidth="4" />
      <rect x="55" y="110" width="90" height="20" fill={T.amber} opacity="0.9" />
      <rect x="55" y="110" width="90" height="20" fill="none" stroke={T.bone} strokeWidth="1" />
      <circle cx="155" cy="115" r="4" fill={T.bone} opacity="0.4" />
      <circle cx="45" cy="115" r="4" fill={T.bone} opacity="0.4" />
      {/* Zipper */}
      <line x1="40" y1="95" x2="160" y2="95" stroke={T.bone} strokeWidth="1" strokeDasharray="2,2" opacity="0.5" />
    </g>
  ),
  bottle: (
    <g>
      {/* Water bottle */}
      <rect x="75" y="45" width="50" height="14" rx="2" fill={T.bone} />
      <rect x="78" y="59" width="44" height="8" fill={T.amber} />
      <path d="M 75 67 L 75 165 Q 75 175 85 175 L 115 175 Q 125 175 125 165 L 125 67 Z" fill={T.bone} />
      {/* Label band */}
      <rect x="75" y="100" width="50" height="35" fill={T.bone} opacity="0.18" />
      <line x1="82" y1="110" x2="118" y2="110" stroke={T.bone} strokeWidth="1.2" opacity="0.5" />
      <line x1="82" y1="118" x2="118" y2="118" stroke={T.bone} strokeWidth="1.2" opacity="0.5" />
      <line x1="82" y1="126" x2="105" y2="126" stroke={T.bone} strokeWidth="1.2" opacity="0.5" />
      {/* Highlight */}
      <line x1="80" y1="80" x2="80" y2="160" stroke={T.bone} strokeWidth="2" opacity="0.25" />
    </g>
  ),
  // ---- FITNESS -----------------------------------------------------------
  runner: (
    <g>
      {/* Running shoe: streamlined silhouette with cushioned sole */}
      <path d="M 25 115 Q 25 95 40 90 L 75 82 Q 105 80 135 88 Q 160 95 175 110 L 175 125 Z" fill={T.bone} />
      <path d="M 25 125 L 175 125 Q 175 140 165 145 L 40 145 Q 25 140 25 130 Z" fill={T.bone} />
      <path d="M 25 132 Q 100 138 175 132" fill="none" stroke={T.amber} strokeWidth="2.5" />
      {/* Sole detail */}
      <line x1="35" y1="140" x2="40" y2="146" stroke={T.bone} strokeWidth="1" opacity="0.4" />
      <line x1="55" y1="140" x2="60" y2="146" stroke={T.bone} strokeWidth="1" opacity="0.4" />
      <line x1="75" y1="140" x2="80" y2="146" stroke={T.bone} strokeWidth="1" opacity="0.4" />
      <line x1="95" y1="140" x2="100" y2="146" stroke={T.bone} strokeWidth="1" opacity="0.4" />
      <line x1="115" y1="140" x2="120" y2="146" stroke={T.bone} strokeWidth="1" opacity="0.4" />
      <line x1="135" y1="140" x2="140" y2="146" stroke={T.bone} strokeWidth="1" opacity="0.4" />
      {/* Stripes */}
      <path d="M 60 100 Q 100 95 145 105" fill="none" stroke={T.bone} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M 65 110 Q 100 105 140 115" fill="none" stroke={T.bone} strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
    </g>
  ),
  weights: (
    <g>
      {/* Dumbbell */}
      <rect x="85" y="92" width="30" height="16" fill={T.bone} />
      <rect x="60" y="75" width="22" height="50" rx="3" fill={T.bone} />
      <rect x="118" y="75" width="22" height="50" rx="3" fill={T.bone} />
      <rect x="48" y="85" width="14" height="30" rx="2" fill={T.bone} />
      <rect x="138" y="85" width="14" height="30" rx="2" fill={T.bone} />
      {/* Grip texture */}
      <line x1="88" y1="100" x2="112" y2="100" stroke={T.amber} strokeWidth="1" />
      <line x1="88" y1="96" x2="112" y2="96" stroke={T.amber} strokeWidth="1" opacity="0.5" />
      <line x1="88" y1="104" x2="112" y2="104" stroke={T.amber} strokeWidth="1" opacity="0.5" />
      {/* Plate centers */}
      <circle cx="71" cy="100" r="3" fill={T.amber} />
      <circle cx="129" cy="100" r="3" fill={T.amber} />
    </g>
  ),
  tee: (
    <g>
      {/* T-shirt: classic crewneck silhouette */}
      <path d="M 60 60 L 80 50 Q 100 55 120 50 L 140 60 L 165 80 L 150 110 L 140 100 L 140 165 L 60 165 L 60 100 L 50 110 L 35 80 Z" fill={T.bone} />
      <path d="M 85 55 Q 100 65 115 55" fill="none" stroke={T.bone} strokeWidth="2" />
      {/* Logo */}
      <circle cx="100" cy="110" r="12" fill={T.amber} />
      <text x="100" y="115" textAnchor="middle" fontSize="14" fontFamily="serif" fontWeight="bold" fill={T.bone}>A</text>
      {/* Hem */}
      <line x1="60" y1="160" x2="140" y2="160" stroke={T.bone} strokeWidth="1" opacity="0.3" />
    </g>
  ),
  yoga: (
    <g>
      {/* Rolled yoga mat */}
      <ellipse cx="60" cy="100" rx="20" ry="55" fill={T.bone} />
      <ellipse cx="60" cy="100" rx="14" ry="42" fill={T.amber} opacity="0.6" />
      <ellipse cx="60" cy="100" rx="8" ry="28" fill={T.bone} opacity="0.8" />
      <rect x="60" y="50" width="100" height="100" fill={T.bone} opacity="0.85" />
      <path d="M 60 50 Q 110 45 160 55" fill="none" stroke={T.bone} strokeWidth="0.8" opacity="0.4" />
      <path d="M 60 150 Q 110 155 160 145" fill="none" stroke={T.bone} strokeWidth="0.8" opacity="0.4" />
      {/* Strap */}
      <rect x="100" y="48" width="6" height="104" fill={T.amber} />
    </g>
  ),
  // ---- CAMPING -----------------------------------------------------------
  shelter: (
    <g>
      {/* Dome tent: triangular shape with door flap */}
      <path d="M 30 160 L 100 50 L 170 160 Z" fill={T.bone} />
      <path d="M 100 50 L 100 160" stroke={T.bone} strokeWidth="1.5" opacity="0.3" />
      <path d="M 100 65 L 80 160 L 120 160 L 100 65 Z" fill={T.bone} opacity="0.18" />
      <path d="M 100 65 L 80 160" stroke={T.bone} strokeWidth="1" opacity="0.4" />
      <path d="M 100 65 L 120 160" stroke={T.bone} strokeWidth="1" opacity="0.4" />
      {/* Stake lines */}
      <line x1="30" y1="160" x2="20" y2="170" stroke={T.amber} strokeWidth="1.5" />
      <line x1="170" y1="160" x2="180" y2="170" stroke={T.amber} strokeWidth="1.5" />
      <line x1="30" y1="160" x2="170" y2="160" stroke={T.bone} strokeWidth="2.5" />
    </g>
  ),
  sleep: (
    <g>
      {/* Sleeping bag: mummy silhouette with diagonal zipper */}
      <path d="M 50 60 Q 65 50 100 50 Q 135 50 150 60 L 155 145 Q 150 165 100 168 Q 50 165 45 145 Z" fill={T.bone} />
      <line x1="100" y1="55" x2="135" y2="165" stroke={T.amber} strokeWidth="1.5" strokeDasharray="3,2" />
      <circle cx="100" cy="80" r="14" fill={T.bone} opacity="0.18" />
      {/* Hood drawstring */}
      <path d="M 85 60 Q 100 70 115 60" fill="none" stroke={T.bone} strokeWidth="1" />
      <circle cx="80" cy="62" r="2" fill={T.amber} />
      <circle cx="120" cy="62" r="2" fill={T.amber} />
    </g>
  ),
  furniture: (
    <g>
      {/* Camp chair: side profile */}
      <path d="M 40 145 L 60 90 L 140 90 L 160 145" fill="none" stroke={T.bone} strokeWidth="4" />
      <path d="M 60 90 L 60 60 L 140 60 L 140 90" fill={T.bone} />
      <rect x="60" y="90" width="80" height="35" fill={T.bone} />
      <line x1="65" y1="100" x2="135" y2="100" stroke={T.amber} strokeWidth="2" />
      <line x1="65" y1="110" x2="135" y2="110" stroke={T.amber} strokeWidth="2" opacity="0.6" />
      <line x1="65" y1="120" x2="135" y2="120" stroke={T.amber} strokeWidth="2" opacity="0.4" />
      {/* Legs cross */}
      <line x1="55" y1="125" x2="75" y2="155" stroke={T.bone} strokeWidth="3" />
      <line x1="145" y1="125" x2="125" y2="155" stroke={T.bone} strokeWidth="3" />
    </g>
  ),
  coolers: (
    <g>
      {/* Cooler: rugged rectangle with handle, latch, drain */}
      <rect x="35" y="80" width="130" height="80" rx="6" fill={T.bone} />
      <rect x="35" y="80" width="130" height="14" fill={T.bone} />
      <line x1="35" y1="94" x2="165" y2="94" stroke={T.bone} strokeWidth="1.5" opacity="0.3" />
      <path d="M 60 80 L 60 65 Q 100 55 140 65 L 140 80" fill="none" stroke={T.bone} strokeWidth="3" />
      <rect x="92" y="78" width="16" height="10" rx="2" fill={T.amber} />
      <rect x="40" y="100" width="120" height="50" fill={T.bone} opacity="0.08" />
      <circle cx="50" cy="155" r="3" fill={T.amber} />
      <text x="100" y="135" textAnchor="middle" fontSize="14" fontFamily="serif" fontWeight="bold" fill={T.bone} opacity="0.35">YETI</text>
    </g>
  ),
  cooking: (
    <g>
      {/* Camp stove: dual burner */}
      <rect x="30" y="100" width="140" height="50" rx="4" fill={T.bone} />
      <rect x="30" y="95" width="140" height="8" fill={T.bone} />
      <circle cx="70" cy="125" r="14" fill={T.bone} opacity="0.12" />
      <circle cx="130" cy="125" r="14" fill={T.bone} opacity="0.12" />
      {/* Flame circles */}
      <circle cx="70" cy="125" r="10" fill="none" stroke={T.amber} strokeWidth="1.5" />
      <circle cx="70" cy="125" r="6" fill="none" stroke={T.amber} strokeWidth="1" />
      <circle cx="70" cy="125" r="2" fill={T.amber} />
      <circle cx="130" cy="125" r="10" fill="none" stroke={T.amber} strokeWidth="1.5" />
      <circle cx="130" cy="125" r="6" fill="none" stroke={T.amber} strokeWidth="1" />
      <circle cx="130" cy="125" r="2" fill={T.amber} />
      {/* Knobs */}
      <circle cx="50" cy="160" r="4" fill={T.amber} />
      <circle cx="150" cy="160" r="4" fill={T.amber} />
      {/* Wind guard */}
      <path d="M 30 95 L 25 60 L 175 60 L 170 95" fill="none" stroke={T.bone} strokeWidth="3" />
    </g>
  ),
};

// Map: catalog subcategory → illustration key. Some subcategories share an illustration.
const SUBCATEGORY_TO_ILLUSTRATION = {
  optics: 'optics', blinds: 'blinds', crossbows: 'crossbows', apparel: 'apparel',
  calls: 'calls', footwear: 'footwear', stands: 'stands',
  // Soccer specifics resolved per-SKU below (cleats vs ball vs shinguard vs socks vs bag)
  soccer: 'soccer', accessories: 'bag',
  weights: 'weights',
  // Camping
  shelter: 'shelter', sleep: 'sleep', furniture: 'furniture', coolers: 'coolers', cooking: 'cooking',
};

// Per-SKU override: when subcategory is ambiguous, key off SKU
const SKU_TO_ILLUSTRATION = {
  // Soccer
  't001': 'soccer',       // cleats
  't002': 'ball',         // soccer ball
  't003': 'shinguard',    // shin guards
  't004': 'socks',        // socks
  't005': 'bottle',       // hydroflask
  't006': 'bag',          // duffel
  // Fitness
  'f001': 'runner', 'f002': 'runner', 'f003': 'runner',
  'f004': 'weights',
  'f005': 'tee',
  'f006': 'yoga',
};

const resolveIllustration = (product) => {
  if (!product) return null;
  if (SKU_TO_ILLUSTRATION[product.id]) return ILLUSTRATIONS[SKU_TO_ILLUSTRATION[product.id]];
  const key = SUBCATEGORY_TO_ILLUSTRATION[product.subcategory];
  return key ? ILLUSTRATIONS[key] : null;
};

// Background variants for visual rhythm across grids
// Background variants for visual rhythm — vivid gradient cards with glass feel
const ILLUSTRATION_BGS = [
  `linear-gradient(135deg, rgba(25,70,200,0.18) 0%, rgba(37,99,235,0.12) 100%)`,
  `linear-gradient(135deg, rgba(25,70,200,0.08) 0%, rgba(220,38,38,0.05) 100%)`,
  `linear-gradient(135deg, rgba(37,99,235,0.16) 0%, rgba(25,70,200,0.14) 100%)`,
];

const ProductIllustration = ({ product, size = 'card', photoUrl }) => {
  const illo = resolveIllustration(product);
  const hash = product?.id ? product.id.charCodeAt(product.id.length - 1) % ILLUSTRATION_BGS.length : 0;
  const bg = ILLUSTRATION_BGS[hash];
  const [photoFailed, setPhotoFailed] = useState(false);

  // Allow caller to pass an explicit photo URL (e.g. for PDP gallery thumbnails)
  const effectivePhoto = photoUrl || product?.photo;

  // Reset error state when the URL changes
  useEffect(() => { setPhotoFailed(false); }, [effectivePhoto]);

  // Prefer real product photo if available and hasn't errored
  if (effectivePhoto && !photoFailed) {
    return (
      <div style={{ width: '100%', height: '100%', background: bg, position: 'relative', overflow: 'hidden' }}>
        <img
          src={effectivePhoto}
          alt={product?.name || ''}
          onError={() => setPhotoFailed(true)}
          loading="lazy"
          style={{
            width: '100%', height: '100%',
            objectFit: 'cover',
            display: 'block',
          }}
        />
        {/* Subtle overlay for consistent depth */}
        <div style={{
          position: 'absolute', inset: 0,
          background: `linear-gradient(180deg, transparent 60%, rgba(0,0,0,0.15) 100%)`,
          pointerEvents: 'none',
        }} />
      </div>
    );
  }

  if (!illo) {
    return (
      <div style={{ width: '100%', height: '100%', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        <span className="display" style={{ fontSize: '50%', color: T.text2, opacity: 0.5 }}>{product?.brand?.[0] || '·'}</span>
      </div>
    );
  }

  // SVG fallback (illustrations)
  return (
    <div style={{ width: '100%', height: '100%', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(circle at 50% 40%, rgba(255,255,255,0.06) 0%, transparent 55%)`, pointerEvents: 'none' }} />
      <svg viewBox="0 0 200 200" style={{ width: size === 'thumb' ? '70%' : '78%', height: 'auto', position: 'relative', zIndex: 1, filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.25))' }} xmlns="http://www.w3.org/2000/svg">
        {illo}
      </svg>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(255,255,255,0.03) 1px, transparent 1px), radial-gradient(circle at 70% 60%, rgba(255,255,255,0.02) 1px, transparent 1px)', backgroundSize: '3px 3px, 5px 5px', pointerEvents: 'none' }} />
    </div>
  );
};

// Decorative hero illustrations (large, for Home hero + editorial). One per persona.
const HERO_ILLUSTRATIONS = {
  hunter: (
    <svg viewBox="0 0 400 400" style={{ width: '100%', height: '100%' }} xmlns="http://www.w3.org/2000/svg">
      {/* Big stylized scope + crosshair composition */}
      <circle cx="200" cy="200" r="150" fill="none" stroke={T.amber} strokeWidth="2" opacity="0.4" />
      <circle cx="200" cy="200" r="120" fill="none" stroke={T.amber} strokeWidth="1" opacity="0.3" />
      <circle cx="200" cy="200" r="90" fill={T.bone} />
      <circle cx="200" cy="200" r="80" fill="none" stroke={T.amber} strokeWidth="0.8" />
      <line x1="50" y1="200" x2="350" y2="200" stroke={T.amber} strokeWidth="1" opacity="0.6" />
      <line x1="200" y1="50" x2="200" y2="350" stroke={T.amber} strokeWidth="1" opacity="0.6" />
      <circle cx="200" cy="200" r="3" fill={T.amber} />
      {/* Deer silhouette inside scope */}
      <g transform="translate(155, 145) scale(0.45)" fill={T.amber} opacity="0.95">
        <path d="M 50 100 L 55 80 L 45 65 L 55 60 L 65 70 L 75 60 L 85 60 L 80 75 L 90 80 L 90 100 L 85 110 L 95 130 L 90 135 L 80 125 L 75 130 L 75 145 L 65 145 L 65 130 L 55 130 L 55 145 L 45 145 L 45 125 Z" />
        <path d="M 55 60 L 50 40 L 45 45 L 50 50 M 55 60 L 60 45 L 55 50 M 75 60 L 80 40 L 85 45 L 80 50 M 75 60 L 70 45 L 75 50" stroke={T.amber} strokeWidth="2" fill="none" />
      </g>
    </svg>
  ),
  parent: (
    <svg viewBox="0 0 400 400" style={{ width: '100%', height: '100%' }} xmlns="http://www.w3.org/2000/svg">
      {/* Soccer ball motion composition */}
      <circle cx="200" cy="200" r="130" fill={T.bone} />
      <circle cx="200" cy="200" r="130" fill="none" stroke="#f0c059" strokeWidth="1.5" opacity="0.5" />
      {/* Pentagons pattern */}
      <polygon points="200,140 230,160 220,200 180,200 170,160" fill="#f0c059" />
      <polygon points="200,140 230,160 260,150 268,115 235,100" fill={T.bone} stroke="#f0c059" strokeWidth="2" />
      <polygon points="200,140 170,160 140,150 132,115 165,100" fill={T.bone} stroke="#f0c059" strokeWidth="2" />
      <polygon points="180,200 220,200 230,250 200,275 170,250" fill={T.bone} stroke="#f0c059" strokeWidth="2" />
      <polygon points="230,160 220,200 260,225 290,200 260,150" fill={T.bone} stroke="#f0c059" strokeWidth="2" />
      <polygon points="170,160 180,200 140,225 110,200 140,150" fill={T.bone} stroke="#f0c059" strokeWidth="2" />
      {/* Motion arcs */}
      <path d="M 100 320 Q 200 100 320 280" stroke="#f0c059" strokeWidth="2" fill="none" strokeDasharray="4,4" opacity="0.5" />
    </svg>
  ),
  fitness: (
    <svg viewBox="0 0 400 400" style={{ width: '100%', height: '100%' }} xmlns="http://www.w3.org/2000/svg">
      {/* Bold dumbbell composition with deal burst */}
      <circle cx="200" cy="200" r="150" fill="none" stroke="#f8e3a0" strokeWidth="1" opacity="0.4" />
      <rect x="170" y="180" width="60" height="40" fill="#f8e3a0" />
      <rect x="110" y="140" width="50" height="120" rx="6" fill="#f8e3a0" />
      <rect x="240" y="140" width="50" height="120" rx="6" fill="#f8e3a0" />
      <rect x="85" y="160" width="30" height="80" rx="4" fill="#f8e3a0" />
      <rect x="285" y="160" width="30" height="80" rx="4" fill="#f8e3a0" />
      <line x1="175" y1="195" x2="225" y2="195" stroke={T.redDeep} strokeWidth="3" />
      <line x1="175" y1="205" x2="225" y2="205" stroke={T.redDeep} strokeWidth="3" />
      {/* "SALE" burst */}
      <g transform="translate(310, 100)">
        <polygon points="0,0 14,4 28,0 26,14 34,24 22,30 22,46 8,38 -8,42 -4,28 -16,18 -2,12" fill="#f8e3a0" />
        <text x="9" y="25" textAnchor="middle" fontSize="11" fontFamily="serif" fontWeight="bold" fill={T.redDeep}>30%</text>
      </g>
    </svg>
  ),
};

const HERO_EDITORIAL_ILLUSTRATIONS = {
  hunter: (
    <svg viewBox="0 0 400 400" style={{ width: '100%', height: '100%' }} xmlns="http://www.w3.org/2000/svg">
      {/* Tree silhouettes — field guide vibe */}
      <rect x="180" y="280" width="40" height="80" fill={T.amber} opacity="0.8" />
      <polygon points="200,80 130,200 170,200 110,300 290,300 230,200 270,200" fill={T.amber} />
      <polygon points="100,180 60,260 80,260 50,330 150,330 120,260 140,260" fill={T.amber} opacity="0.7" />
      <polygon points="300,180 340,260 320,260 350,330 250,330 280,260 260,260" fill={T.amber} opacity="0.7" />
      <line x1="0" y1="330" x2="400" y2="330" stroke={T.amber} strokeWidth="2" />
      {/* Moon */}
      <circle cx="320" cy="100" r="30" fill="none" stroke={T.amber} strokeWidth="1.5" />
      <circle cx="335" cy="90" r="30" fill={T.bone} />
    </svg>
  ),
  parent: (
    <svg viewBox="0 0 400 400" style={{ width: '100%', height: '100%' }} xmlns="http://www.w3.org/2000/svg">
      {/* Goal posts + ball */}
      <rect x="60" y="120" width="280" height="6" fill="#f0c059" />
      <rect x="60" y="120" width="6" height="180" fill="#f0c059" />
      <rect x="334" y="120" width="6" height="180" fill="#f0c059" />
      <path d="M 66 130 L 334 130 L 334 295 L 66 295 Z" fill="none" stroke="#f0c059" strokeWidth="1" strokeDasharray="6,8" opacity="0.5" />
      <circle cx="200" cy="280" r="40" fill="#f0c059" />
      <polygon points="200,260 215,272 209,290 191,290 185,272" fill={T.bone} />
      <polygon points="215,272 230,268 230,288 209,290" fill={T.bone} opacity="0.8" />
      <polygon points="185,272 170,268 170,288 191,290" fill={T.bone} opacity="0.8" />
      <line x1="0" y1="320" x2="400" y2="320" stroke="#f0c059" strokeWidth="2" />
    </svg>
  ),
  fitness: (
    <svg viewBox="0 0 400 400" style={{ width: '100%', height: '100%' }} xmlns="http://www.w3.org/2000/svg">
      {/* Discount tag composition */}
      <g transform="translate(200, 200) rotate(-15)">
        <path d="M -100 -60 L 60 -60 L 100 -20 L 100 60 L -100 60 Z" fill="#f8e3a0" />
        <circle cx="60" cy="-20" r="12" fill={T.redDeep} />
        <text x="0" y="0" textAnchor="middle" fontSize="50" fontFamily="serif" fontWeight="bold" fontStyle="italic" fill={T.redDeep}>SALE</text>
        <text x="0" y="30" textAnchor="middle" fontSize="14" fontFamily="monospace" fill={T.redDeep}>UP TO 30% OFF</text>
      </g>
    </svg>
  ),
};

/* ============================================================================
   LAYOUT — TOP BAR (with persona switcher + global search)
   ============================================================================ */
const TopBar = () => {
  const { user, persona, setPersona, view, setView, cart, logout, goToSignIn, shopifyOrders } = useApp();
  const isAdmin = user?.role === 'admin';
  const isAnon = user?.role === 'anonymous';
  const hasOrders = (shopifyOrders?.length || 0) > 0;
  // Customer accounts don't see Merch; admins see all. Anonymous gets the customer view.
  // "Orders" appears only when a live Shopify session has real order history.
  const navItems = isAdmin
    ? [['kit', 'Plan with AI'], ['merch', 'Merch Tool']]
    : [['kit', 'Plan with AI']];
  if (hasOrders) navItems.push(['orders', 'Orders']);
  return (
    <div style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: 'rgba(255,255,255,0.85)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      borderBottom: `1px solid ${T.hairline}`,
      color: T.text,
    }}>
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '16px 32px', display: 'flex', alignItems: 'center', gap: 32 }}>
        <button onClick={() => setView('home')} style={{ background: 'none', border: 0, color: T.text, cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'baseline', gap: 10 }}>
          <span className="display" style={{ fontSize: 24, fontStyle: 'italic' }}>Academy</span>
          <span className="mono" style={{ color: T.amber }}>Sports + Outdoors</span>
        </button>
        <nav style={{ display: 'flex', gap: 4, fontSize: 13, fontWeight: 500, marginLeft: 16 }}>
          {/* Home */}
          {(() => {
            const active = view === 'home';
            return (
              <button onClick={() => setView('home')} style={{
                background: active ? 'rgba(25,70,200,0.08)' : 'transparent',
                border: active ? `1px solid ${T.cyan}33` : '1px solid transparent',
                color: active ? T.cyan : T.text2,
                cursor: 'pointer', padding: '8px 14px', borderRadius: 999,
                fontSize: 13, fontWeight: 500, transition: 'all 0.2s',
              }}>Home</button>
            );
          })()}
          {/* Categories dropdown */}
          <NavCategoriesDropdown active={view === 'category'} setView={setView} />
          {/* Kit (+ Merch if admin) */}
          {navItems.map(([k, l]) => {
            const active = view === k;
            return (
              <button key={k} onClick={() => setView(k)} style={{
                background: active ? 'rgba(25,70,200,0.08)' : 'transparent',
                border: active ? `1px solid ${T.cyan}33` : '1px solid transparent',
                color: active ? T.cyan : T.text2,
                cursor: 'pointer',
                padding: '8px 14px',
                borderRadius: 999,
                fontSize: 13,
                fontWeight: 500,
                transition: 'all 0.2s',
              }}>
                {l}
              </button>
            );
          })}
        </nav>
        <div style={{ flex: 1 }} />
        {/* Admins can preview as any persona; customers are locked to their own */}
        {isAdmin && <PersonaSwitcher persona={persona} setPersona={setPersona} />}
        {isAnon ? <SignInButton onClick={goToSignIn} /> : <UserPill user={user} onLogout={logout} />}
        <button onClick={() => setView('cart')} style={{
          background: 'rgba(15,23,42,0.05)',
          border: `1px solid ${T.hairline}`,
          color: T.text,
          cursor: 'pointer',
          position: 'relative',
          width: 40, height: 40,
          borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <ShoppingCart size={16} />
          {cart.length > 0 && (
            <span style={{
              position: 'absolute', top: -4, right: -4,
              background: T.cyan, color: T.void,
              fontSize: 10, fontWeight: 700,
              padding: '2px 6px', borderRadius: 999, minWidth: 18, textAlign: 'center',
              boxShadow: `0 0 12px ${T.cyan}88`,
            }}>{cart.length}</span>
          )}
        </button>
      </div>
    </div>
  );
};

// Categories nav dropdown — replaces the old hardcoded "Hunting" link
// in the top nav. Opening any category sets a pending filter so the
// CategoryPage knows which category to show.
const NavCategoriesDropdown = ({ active, setView }) => {
  const { setPendingFilter } = useApp();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const pick = (catId) => {
    setView('category');
    setPendingFilter({ facetId: 'category', value: catId, _t: Date.now() });
    setOpen(false);
  };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          background: active ? 'rgba(25,70,200,0.08)' : 'transparent',
          border: active ? `1px solid ${T.cyan}33` : '1px solid transparent',
          color: active ? T.cyan : T.text2,
          cursor: 'pointer',
          padding: '8px 14px',
          borderRadius: 999,
          fontSize: 13,
          fontWeight: 500,
          transition: 'all 0.2s',
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
        Shop <ChevronDown size={14} />
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: '110%', left: 0, zIndex: 100,
          minWidth: 200,
          background: T.ink, border: `1px solid ${T.glassBorderHi}`,
          borderRadius: 8, padding: 6,
          boxShadow: `0 12px 36px rgba(15,23,42,0.18)`,
        }}>
          {CATEGORY_LIST.map(cat => (
            <button
              key={cat.id}
              onClick={() => pick(cat.id)}
              style={{
                width: '100%', textAlign: 'left',
                padding: '10px 12px', background: 'transparent', border: 0,
                color: T.text, fontSize: 13, cursor: 'pointer', borderRadius: 4,
                display: 'flex', alignItems: 'center', gap: 10,
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(15,23,42,0.06)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <span style={{ fontSize: 16 }}>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Anonymous users see this instead of the UserPill. Clicking it takes them
// to the login page while PRESERVING their cart (standard ecommerce UX).
const SignInButton = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 8,
        background: T.gradHero,
        border: 0,
        color: 'white',
        padding: '7px 14px', borderRadius: 999,
        cursor: 'pointer', fontSize: 12, fontWeight: 700, letterSpacing: 0.5,
        boxShadow: `0 4px 16px ${T.violet}44`,
        transition: 'all 0.2s',
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = `0 8px 24px ${T.violet}66`; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 4px 16px ${T.violet}44`; }}
    >
      SIGN IN <ArrowRight size={12} />
    </button>
  );
};

// Shows the currently signed-in user with a hover-to-reveal logout button.
// Lives next to the cart icon in the top nav.
const UserPill = ({ user, onLogout }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  if (!user) return null;
  const accent = user.role === 'admin' ? '#1946c8' : '#2563eb';

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: `${accent}14`,
          border: `1px solid ${accent}55`,
          color: T.text,
          padding: '6px 12px', borderRadius: 999,
          cursor: 'pointer', fontSize: 12, fontWeight: 600,
        }}
      >
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: accent }} />
        <span>{user.displayName}</span>
        <ChevronDown size={12} color={T.text3} />
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: '110%', right: 0, zIndex: 100,
          minWidth: 200,
          background: T.ink, border: `1px solid ${T.glassBorderHi}`,
          borderRadius: 8, padding: 6,
          boxShadow: `0 12px 36px rgba(15,23,42,0.18)`,
        }}>
          <div style={{ padding: '8px 12px', borderBottom: `1px solid ${T.hairline}` }}>
            <div className="mono" style={{ color: T.text3, fontSize: 10, marginBottom: 4 }}>
              SIGNED IN AS
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{user.displayName}</div>
            <div className="mono" style={{ color: accent, fontSize: 10, marginTop: 2 }}>
              {user.role}
            </div>
          </div>
          <button
            onClick={() => { setOpen(false); onLogout(); }}
            style={{
              width: '100%', textAlign: 'left',
              padding: '10px 12px', background: 'transparent', border: 0,
              color: T.red, fontSize: 12, fontWeight: 600, cursor: 'pointer', borderRadius: 4,
              display: 'flex', alignItems: 'center', gap: 8,
              marginTop: 4,
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,77,77,0.06)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
};

const PersonaSwitcher = ({ persona, setPersona }) => {
  const [open, setOpen] = useState(false);
  const current = PERSONAS[personaKey(persona)];
  return (
    <div style={{ position: 'relative' }}>
      <button onClick={() => setOpen(o => !o)} style={{
        display: 'flex', alignItems: 'center', gap: 10,
        background: 'rgba(15,23,42,0.06)',
        border: `1px solid ${T.hairlineStrong}`,
        color: T.text,
        padding: '6px 6px 6px 14px', borderRadius: 999,
        cursor: 'pointer', fontSize: 13, fontWeight: 600,
        backdropFilter: 'blur(12px)',
      }}>
        <span style={{ fontSize: 16 }}>{current.icon}</span>
        <span>{current.name}</span>
        <span style={{
          background: T.cyan, color: T.void,
          padding: '4px 8px', borderRadius: 999, fontSize: 11,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <ChevronDown size={12} />
        </span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            style={{
              position: 'absolute', top: 'calc(100% + 10px)', right: 0,
              background: 'rgba(255,255,255,0.97)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              color: T.text,
              borderRadius: 12, padding: 8, minWidth: 340,
              boxShadow: `0 24px 80px rgba(15,23,42,0.15), 0 0 0 1px ${T.hairlineStrong}`,
              border: `1px solid ${T.hairlineStrong}`,
            }}>
            <div className="mono" style={{ padding: '10px 12px', color: T.cyan, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Sparkles size={11} /> Switch persona · live re-personalize
            </div>
            {Object.values(PERSONAS).map(p => {
              const active = p.id === persona;
              return (
                <button key={p.id} onClick={() => { setPersona(p.id); setOpen(false); }} style={{
                  display: 'flex', alignItems: 'center', gap: 14, width: '100%',
                  padding: 12,
                  background: active ? 'rgba(25,70,200,0.08)' : 'transparent',
                  border: active ? `1px solid ${T.cyan}33` : '1px solid transparent',
                  borderRadius: 8, cursor: 'pointer', textAlign: 'left', marginBottom: 2,
                  color: T.text,
                  transition: 'all 0.15s',
                }}>
                  <span style={{ fontSize: 24 }}>{p.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: T.text2 }}>{p.sub}</div>
                  </div>
                  {active && <Check size={16} color={T.cyan} />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ============================================================================
   HOME PAGE — persona-aware hero, trays, editorial
   ============================================================================ */
const HOME_HEROES = {
  hunter: {
    eyebrow: 'Deer Season · Texas Region',
    title: 'Pre-Season Ready.',
    titleAlt: 'Built for the Hunt.',
    body: 'Glass, blinds, and scent control — everything dialed before opening morning.',
    cta: 'Shop Deer Season',
    bg: 'linear-gradient(135deg, rgba(25,70,200,0.07) 0%, rgba(200,16,46,0.05) 55%, rgba(255,255,255,0) 100%)',
    glow: 'radial-gradient(ellipse 70% 60% at 25% 50%, rgba(200,16,46,0.09) 0%, transparent 65%), radial-gradient(ellipse 50% 40% at 80% 80%, rgba(25,70,200,0.07) 0%, transparent 65%)',
    accent: T.amber,
    image: '🦌',
  },
  parent: {
    eyebrow: 'Fall Season · Youth Sports',
    title: 'Game Day',
    titleAlt: 'Starts Here.',
    body: 'Cleats, balls, water bottles — outfit the season in one cart.',
    cta: 'Shop Team Sports',
    bg: 'linear-gradient(135deg, rgba(25,70,200,0.08) 0%, rgba(37,99,235,0.05) 55%, rgba(255,255,255,0) 100%)',
    glow: 'radial-gradient(ellipse 70% 60% at 25% 50%, rgba(37,99,235,0.10) 0%, transparent 65%), radial-gradient(ellipse 50% 40% at 80% 80%, rgba(25,70,200,0.07) 0%, transparent 65%)',
    accent: T.cyan,
    image: '⚽',
  },
  fitness: {
    eyebrow: 'Limited Time · Up to 30% Off',
    title: 'Move Better.',
    titleAlt: 'Save More.',
    body: 'Shoes, weights, and apparel built to train hard and last.',
    cta: 'Shop Deals',
    bg: 'linear-gradient(135deg, rgba(200,16,46,0.07) 0%, rgba(25,70,200,0.05) 55%, rgba(255,255,255,0) 100%)',
    glow: 'radial-gradient(ellipse 70% 60% at 25% 50%, rgba(200,16,46,0.10) 0%, transparent 65%), radial-gradient(ellipse 50% 40% at 80% 80%, rgba(25,70,200,0.08) 0%, transparent 65%)',
    accent: T.pink,
    image: '🏃',
  },
  // Anonymous hero — emphasizes range and invites sign-in rather than pushing
  // any one category. Calm palette, no aggressive persona-specific cues.
  guest: {
    eyebrow: 'Welcome to Academy',
    title: 'Sport, Outdoors,',
    titleAlt: 'All Year Round.',
    body: 'Browse our full range. Sign in to unlock personalized recommendations across categories.',
    cta: 'Browse the Store',
    bg: 'linear-gradient(135deg, rgba(25,70,200,0.06) 0%, rgba(200,16,46,0.04) 55%, rgba(255,255,255,0) 100%)',
    glow: 'radial-gradient(ellipse 70% 60% at 25% 50%, rgba(25,70,200,0.28) 0%, transparent 65%), radial-gradient(ellipse 50% 40% at 80% 80%, rgba(37,99,235,0.18) 0%, transparent 65%)',
    accent: T.cyan,
    image: '✨',
  },
};

// ============================================================================
// PRODUCT GALLERY — alternate photos for PDP thumbnail strip
// ============================================================================
// For each category, we keep a small pool of "context" / "lifestyle" alternates.
// Combined with the product's main photo, each product gets a 4-image gallery
// that demonstrates real scroll-and-swap on the PDP without needing 4 unique
// photos for every single SKU.
const CATEGORY_ALT_PHOTOS = {
  hunting: [
    'https://images.unsplash.com/photo-1493863641943-9b68992a8d07?w=800&q=80', // hunter at dawn in field
    'https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?w=800&q=80', // forest tree stand scene
    'https://images.unsplash.com/photo-1606639386377-7eb78f9b0571?w=800&q=80', // trail-cam dawn scene
  ],
  'team-sports': [
    'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80', // soccer kids on field
    'https://images.unsplash.com/photo-1518604666860-9ed391f76460?w=800&q=80', // training cones drill
    'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&q=80', // basketball hoop court
  ],
  fitness: [
    'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80', // gym interior
    'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=800&q=80', // runner on track
    'https://images.unsplash.com/photo-1599447421416-3414500d18a5?w=800&q=80', // yoga studio
  ],
  camping: [
    'https://images.unsplash.com/photo-1537565266759-34bbc16be345?w=800&q=80', // tent under stars
    'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&q=80', // campsite firepit
    'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&q=80', // hiker on trail
  ],
  fishing: [
    'https://images.unsplash.com/photo-1523398002811-999ca8dec234?w=800&q=80', // dawn lake fishing
    'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80', // pier fishing scene
    'https://images.unsplash.com/photo-1623509789543-d8da40b6f23a?w=800&q=80', // kayak on water
  ],
};

// Build a 4-image gallery for a product:
//   [main photo, alt 1, alt 2, alt 3]
// On Shopify-backed products, prefer Shopify's own images array if it has 2+.
// Otherwise fall back to category alternates.
const getProductPhotos = (product) => {
  if (!product) return [];
  // If product was hydrated with multi-image data (Shopify), use those
  if (Array.isArray(product.photos) && product.photos.length > 1) {
    return product.photos.slice(0, 4);
  }
  // Single-image case: pad with category alternates
  const main = product.photo;
  const alts = CATEGORY_ALT_PHOTOS[product.category] || CATEGORY_ALT_PHOTOS.hunting;
  return [main, ...alts].filter(Boolean).slice(0, 4);
};

const HOME_TRAYS = {
  hunter: [
    { title: 'Optics & Sighting', subtitle: 'Top-rated scopes, binos, and trail cams', ids: ['h001', 'h009', 'h015'] },
    { title: 'Concealment Essentials', subtitle: 'Blinds, stands, and camo apparel', ids: ['h002', 'h005', 'h008'] },
    { title: 'Crossbows & Firearms', subtitle: 'From beginner to premium', ids: ['h004', 'h003', 'h010'] },
    { title: 'Field Gear', subtitle: 'Boots, knives, packs', ids: ['h007', 'h013', 'h012'] },
  ],
  parent: [
    { title: 'Youth Soccer Starter Pack', subtitle: 'Everything for the season', ids: ['t001', 't002', 't003'] },
    { title: 'Team Bundle Savings', subtitle: 'Save when buying together', ids: ['t004', 't005', 't013'] },
    { title: 'Baseball & Basketball', subtitle: 'Other youth sports', ids: ['t007', 't008', 't009'] },
    { title: 'Family Outdoor', subtitle: 'Weekends made easy', ids: ['c001', 'c003', 'c005'] },
  ],
  fitness: [
    { title: 'Deals Under $50', subtitle: 'Limited stock', ids: ['f005', 'f009', 't005'] },
    { title: 'Premium Running Shoes', subtitle: 'Stability and cushion picks', ids: ['f001', 'f002', 'f007'] },
    { title: 'Home Gym Builders', subtitle: 'Equipment for your space', ids: ['f004', 'f010', 'f011'] },
    { title: 'Wearables & Apparel', subtitle: 'Track and train in style', ids: ['f015', 'f014', 'f013'] },
  ],
  // Anonymous shopper: cross-category bestsellers. No persona signal yet, so we
  // show breadth across hunting/team-sports/fitness/camping/fishing.
  guest: [
    { title: 'Featured This Week', subtitle: 'Top-rated across all departments', ids: ['h001', 't001', 'f001', 'c001'] },
    { title: 'Best Sellers · Outdoors', subtitle: 'Camping, fishing, and hunting essentials', ids: ['c004', 'fi001', 'h007', 'c003'] },
    { title: 'Best Sellers · Sport & Fitness', subtitle: 'Most-loved across team and training', ids: ['f001', 't007', 'f015', 't009'] },
    { title: 'Trending Deals', subtitle: 'Sale picks across the store', ids: ['f005', 'h004', 't005', 'fi009'] },
  ],
};

const HOME_EDITORIAL = {
  hunter: { tag: 'Field Guide', title: 'Deer Season Prep: 14 Days Out', body: 'A pre-season checklist from our Texas pro staff — gear setup, scent strategy, and a stand-placement primer.', image: '🌲' },
  parent: { tag: 'Back to Season', title: 'Outfitting a First-Year Soccer Player', body: 'Sizing youth cleats, choosing the right shin guards, and what every parent should pack on game day.', image: '⚽' },
  fitness: { tag: 'Deal Drop', title: 'This Week\'s Top 10 Markdowns', body: 'Editor picks — shoes, apparel, and home-gym gear at the lowest prices we\'ve seen this season.', image: '🔥' },
  guest: { tag: 'Welcome', title: 'Sign in for a personalized experience', body: 'We tailor recommendations, sort, and content for each customer. Sign in or create an account to see what\'s most relevant to you.', image: '✨' },
};

const HomePage = () => {
  const { persona, heroOverrides } = useApp();
  const pKey = personaKey(persona);
  // Hero data — base from constants, then overlay any Merch admin override
  // for this persona. The override is just the body copy; everything else
  // (eyebrow, title, image, colors) stays from the base.
  const baseHero = HOME_HEROES[pKey];
  const overrideText = heroOverrides?.[pKey];
  const hero = overrideText ? { ...baseHero, body: overrideText } : baseHero;
  const trays = HOME_TRAYS[pKey];
  const editorial = HOME_EDITORIAL[pKey];
  return (
    <motion.div key={pKey} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      {/* HERO */}
      <section style={{ background: hero.bg, color: T.text, position: 'relative', overflow: 'hidden' }}>
        {/* Atmospheric glow layer */}
        <div style={{ position: 'absolute', inset: 0, background: hero.glow, pointerEvents: 'none' }} />
        {/* Subtle grid pattern */}
        <div className="grid-bg" style={{ position: 'absolute', inset: 0, opacity: 0.4, pointerEvents: 'none' }} />
        <div className="grain" style={{ position: 'absolute', inset: 0, opacity: 0.3, pointerEvents: 'none' }} />

        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '100px 32px 120px', position: 'relative', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' }}>
          <motion.div initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.15, duration: 0.6 }}>
            <div className="mono" style={{ color: hero.accent, marginBottom: 28, display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ width: 32, height: 1, background: hero.accent, boxShadow: `0 0 8px ${hero.accent}` }} />
              {hero.eyebrow}
            </div>
            <h1 className="display" style={{ fontSize: 92, margin: 0, lineHeight: 0.92, color: T.text }}>
              {hero.title}<br />
              <span style={{
                fontStyle: 'italic',
                background: T.gradHero,
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: `drop-shadow(0 4px 20px ${T.violet}44)`,
              }}>{hero.titleAlt}</span>
            </h1>
            <p style={{ fontSize: 17, lineHeight: 1.55, marginTop: 32, maxWidth: 460, color: T.text2 }}>{hero.body}</p>
            <button style={{
              marginTop: 40,
              background: T.gradHero,
              color: 'white',
              border: 0,
              padding: '18px 32px',
              fontWeight: 700, fontSize: 14,
              cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 10,
              letterSpacing: 0.5,
              borderRadius: 999,
              boxShadow: `0 8px 32px ${T.violet}55, 0 0 60px ${T.pink}33, inset 0 1px 0 rgba(255,255,255,0.25)`,
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 12px 48px ${T.violet}77, 0 0 80px ${T.pink}55, inset 0 1px 0 rgba(255,255,255,0.3)`; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 8px 32px ${T.violet}55, 0 0 60px ${T.pink}33, inset 0 1px 0 rgba(255,255,255,0.25)`; }}
            >
              {hero.cta} <ArrowRight size={16} />
            </button>
          </motion.div>
          <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.25, duration: 0.7 }} style={{ width: '100%', maxWidth: 500, margin: '0 auto', filter: `drop-shadow(0 24px 60px ${hero.accent}22)` }}>
            {HERO_ILLUSTRATIONS[persona]}
          </motion.div>
        </div>
      </section>

      {/* TRAYS */}
      <section style={{ maxWidth: 1400, margin: '0 auto', padding: '80px 32px 40px' }}>
        {trays.map((tray, i) => (
          <ProductTray key={tray.title + persona} {...tray} index={i} />
        ))}
      </section>

      {/* EDITORIAL */}
      <section style={{ background: T.ink2, color: T.text, marginTop: 40, position: 'relative', overflow: 'hidden', borderTop: `1px solid ${T.hairline}`, borderBottom: `1px solid ${T.hairline}` }}>
        <div className="grid-bg" style={{ position: 'absolute', inset: 0, opacity: 0.3, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '50%', left: '60%', width: 400, height: 400, background: `radial-gradient(circle, ${T.amber}22 0%, transparent 70%)`, transform: 'translate(-50%, -50%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '80px 32px', display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 80, alignItems: 'center', position: 'relative' }}>
          <div>
            <div className="mono" style={{ color: T.amber, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 24, height: 1, background: T.amber }} />
              {editorial.tag} · For {PERSONAS[pKey].name}
            </div>
            <h2 className="display" style={{ fontSize: 56, margin: 0 }}>{editorial.title}</h2>
            <p style={{ fontSize: 16, lineHeight: 1.6, marginTop: 24, color: T.text2, maxWidth: 540 }}>{editorial.body}</p>
            <button style={{
              marginTop: 32,
              background: 'transparent',
              color: T.text,
              border: `1px solid ${T.hairlineStrong}`,
              padding: '14px 24px',
              fontWeight: 500, fontSize: 13,
              cursor: 'pointer',
              letterSpacing: 1,
              borderRadius: 4,
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = T.amber; e.currentTarget.style.color = T.amber; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = T.hairlineStrong; e.currentTarget.style.color = T.text; }}
            >
              READ THE GUIDE →
            </button>
          </div>
          <div style={{ width: '100%', maxWidth: 400, margin: '0 auto' }}>{HERO_EDITORIAL_ILLUSTRATIONS[persona]}</div>
        </div>
      </section>
    </motion.div>
  );
};

const ProductTray = ({ title, subtitle, ids, index }) => {
  const { adapterId } = useApp();
  const [products, setProducts] = useState([]);
  useEffect(() => {
    Promise.all(ids.map(id => adapter.getProduct(id))).then(setProducts);
  }, [ids.join('|'), adapterId]);
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * index }} style={{ marginBottom: 72 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 28, borderBottom: `1px solid ${T.hairline}`, paddingBottom: 18 }}>
        <div>
          <h2 className="display" style={{ fontSize: 38, margin: 0, color: T.text }}>{title}</h2>
          <div className="mono" style={{ color: T.text3, marginTop: 8 }}>{subtitle}</div>
        </div>
        <button style={{
          background: 'transparent', border: 0, color: T.text2,
          cursor: 'pointer', fontSize: 12, fontWeight: 600, letterSpacing: 1,
          transition: 'color 0.2s',
        }}
        onMouseEnter={e => { e.currentTarget.style.color = T.cyan; }}
        onMouseLeave={e => { e.currentTarget.style.color = T.text2; }}
        >VIEW ALL →</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
        {products.map(p => p && <ProductCard key={p.id} product={p} />)}
      </div>
    </motion.div>
  );
};

/* ============================================================================
   PRODUCT CARD (shared)
   ============================================================================ */
const ProductCard = ({ product, compact = false, pinned = false }) => {
  const { setView, setActiveProduct } = useApp();
  const [hover, setHover] = useState(false);
  const onSale = product.compareAt && product.compareAt > product.price;
  return (
    <motion.button
      whileHover={{ y: -6 }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => { setActiveProduct(product.id); setView('pdp'); }}
      style={{
        background: hover
          ? 'linear-gradient(135deg, rgba(25,70,200,0.06) 0%, rgba(25,70,200,0.02) 100%)'
          : 'linear-gradient(135deg, rgba(15,23,42,0.03) 0%, rgba(15,23,42,0.015) 100%)',
        backdropFilter: 'blur(20px) saturate(160%)',
        WebkitBackdropFilter: 'blur(20px) saturate(160%)',
        // Pinned products get a violet glow border to visibly differentiate
        // them on the storefront — makes the Merch Tool's pinning action
        // visible to demo audiences.
        border: `1px solid ${pinned ? T.violet : (hover ? T.glassBorderHi : T.glassBorder)}`,
        padding: 0,
        textAlign: 'left',
        cursor: 'pointer',
        overflow: 'hidden',
        borderRadius: 12,
        display: 'flex',
        flexDirection: 'column',
        boxShadow: pinned
          ? `0 8px 32px ${T.violet}55, 0 0 40px ${T.violet}33, inset 0 1px 0 rgba(255,255,255,0.12)`
          : hover
            ? `0 16px 40px rgba(15,23,42,0.14), 0 0 0 1px ${T.violet}22`
            : `0 2px 10px rgba(15,23,42,0.08), 0 1px 2px rgba(15,23,42,0.04)`,
        transition: 'box-shadow 0.3s, border-color 0.3s, background 0.3s',
      }}
    >
      <div style={{ aspectRatio: '1', position: 'relative' }}>
        <ProductIllustration product={product} size={compact ? 'thumb' : 'card'} />
        {pinned && (
          <span style={{
            position: 'absolute', top: 12, right: 12,
            background: T.violet, color: 'white',
            padding: '4px 10px', fontSize: 10, fontWeight: 700, letterSpacing: 0.5, zIndex: 2,
            borderRadius: 999,
            display: 'flex', alignItems: 'center', gap: 4,
            boxShadow: `0 4px 14px ${T.violet}88`,
          }}>
            <Pin size={10} />
            FEATURED
          </span>
        )}
        {onSale && (
          <span style={{
            position: 'absolute', top: 12, left: 12,
            background: T.gradAmber, color: 'white',
            padding: '5px 12px', fontSize: 10, fontWeight: 700, letterSpacing: 1, zIndex: 2,
            borderRadius: 999,
            boxShadow: `0 4px 16px ${T.pink}66, inset 0 1px 0 rgba(255,255,255,0.3)`,
          }}>SALE</span>
        )}
      </div>
      <div style={{ padding: compact ? 14 : 20 }}>
        <div className="mono" style={{ color: T.amber, marginBottom: 8 }}>{product.brand}</div>
        <div style={{ fontWeight: 500, fontSize: compact ? 13 : 15, lineHeight: 1.35, marginBottom: 12, minHeight: compact ? 'auto' : 42, color: T.text }}>{product.name}</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 6 }}>
          <span style={{ fontWeight: 700, fontSize: compact ? 14 : 18, color: T.text }}>${product.price.toFixed(2)}</span>
          {onSale && <span style={{ color: T.text3, textDecoration: 'line-through', fontSize: 12 }}>${product.compareAt.toFixed(2)}</span>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: T.text2 }}>
          <Star size={11} fill={T.amber} stroke={T.amber} /> {product.rating} <span style={{ color: T.text3 }}>({product.reviews})</span>
        </div>
      </div>
    </motion.button>
  );
};

/* ============================================================================
   CATEGORY PAGE — Hunting
   ============================================================================ */
// Category banners are keyed by CATEGORY, not persona. Each category gets its
// own headline/imagery so when the user (or admin previewing as one persona)
// navigates to a different category, the page header reflects what they're
// actually looking at — not their persona's primary category.
//
// Each entry can optionally provide persona-specific sub-copy via `subByPersona`.
// Falls back to the generic `sub` if no persona match.
const CATEGORY_BANNERS = {
  hunting: {
    title: 'Hunting Essentials',
    sub: 'Optics, blinds, crossbows, and concealment.',
    subByPersona: {
      hunter: 'Deer-season picks from our Texas pro staff — optics, blinds, and concealment.',
      parent: 'Family-friendly outdoor essentials and beginner setups.',
      fitness: 'Outdoor gear that doubles for the gym and the woods.',
    },
    bg: 'linear-gradient(135deg, rgba(25,70,200,0.06) 0%, rgba(255,255,255,0) 100%)',
    glow: `radial-gradient(ellipse at 30% 50%, ${T.amber}22 0%, transparent 60%)`,
  },
  'team-sports': {
    title: 'Team Sports',
    sub: 'Cleats, balls, jerseys, and training gear.',
    subByPersona: {
      hunter: 'Off-season cross-training and family-friendly team gear.',
      parent: 'Youth-sized cleats, shin guards, and team-pack savings — back-to-season ready.',
      fitness: 'Performance training tools across soccer, basketball, and baseball.',
    },
    bg: 'linear-gradient(135deg, rgba(25,70,200,0.06) 0%, rgba(255,255,255,0) 100%)',
    glow: `radial-gradient(ellipse at 30% 50%, ${T.cyan}22 0%, transparent 60%)`,
  },
  fitness: {
    title: 'Fitness & Training',
    sub: 'Shoes, weights, apparel, and home-gym builders.',
    subByPersona: {
      hunter: 'Off-season conditioning gear, cardio, and strength essentials.',
      parent: 'Family fitness picks — apparel and equipment that grows with you.',
      fitness: 'Editor-picked deals on running shoes, weights, and apparel — up to 30% off.',
    },
    bg: 'linear-gradient(135deg, rgba(25,70,200,0.06) 0%, rgba(255,255,255,0) 100%)',
    glow: `radial-gradient(ellipse at 30% 50%, ${T.red}22 0%, transparent 60%)`,
  },
  camping: {
    title: 'Camping & Outdoor',
    sub: 'Tents, sleeping bags, coolers, and lanterns.',
    subByPersona: {
      hunter: 'Backcountry shelter and warmth — built for the hunt camp.',
      parent: 'Family-friendly tents, cookware, and easy-setup gear.',
      fitness: 'Lightweight, durable kit for trail trips and active outdoors.',
    },
    bg: 'linear-gradient(135deg, rgba(25,70,200,0.06) 0%, rgba(255,255,255,0) 100%)',
    glow: `radial-gradient(ellipse at 30% 50%, ${T.lime}22 0%, transparent 60%)`,
  },
  fishing: {
    title: 'Fishing',
    sub: 'Rods, reels, lures, tackle, and kayaks.',
    subByPersona: {
      hunter: 'Off-season fishing — rods, reels, and crossover gear.',
      parent: 'Beginner-friendly setups for taking kids out on the water.',
      fitness: 'Active-paddling kayaks, gear, and durable rods for serious anglers.',
    },
    bg: 'linear-gradient(135deg, rgba(25,70,200,0.06) 0%, rgba(255,255,255,0) 100%)',
    glow: `radial-gradient(ellipse at 30% 50%, ${T.cyan}22 0%, transparent 60%)`,
  },
  // Neutral fallback when no category is loaded (shouldn't normally happen,
  // but defensive). Also used for anonymous browsing before a category is picked.
  default: {
    title: 'Shop the Category',
    sub: 'Browse our full range. Sign in to see picks personalized for you.',
    subByPersona: {},
    bg: 'linear-gradient(135deg, rgba(25,70,200,0.06) 0%, rgba(255,255,255,0) 100%)',
    glow: `radial-gradient(ellipse at 30% 50%, ${T.text3}22 0%, transparent 60%)`,
  },
};

// Helper to resolve the right banner copy for the current category + persona.
// Picks the category banner, then overlays persona-specific sub-copy if defined.
const resolveCategoryBanner = (categoryId, persona) => {
  const base = CATEGORY_BANNERS[categoryId] || CATEGORY_BANNERS.default;
  const personaSub = (persona && base.subByPersona?.[persona]) || base.sub;
  return { ...base, sub: personaSub };
};

// Price bucket helpers
const PRICE_BUCKETS = {
  'Under $50': (p) => p < 50,
  '$50–$200': (p) => p >= 50 && p < 200,
  '$200–$500': (p) => p >= 200 && p < 500,
  'Over $500': (p) => p >= 500,
};

// Map facet values to product matchers
const FACET_MATCHERS = {
  subcategory: (product, value) => product.subcategory?.toLowerCase() === value.toLowerCase(),
  brand: (product, value) => product.brand === value,
  price: (product, value) => PRICE_BUCKETS[value]?.(product.price) ?? true,
  // LLM can apply these via chat: { type: 'applyFilter', facetId: 'category', value: 'hunting' }
  category: (product, value) => product.category?.toLowerCase() === value.toLowerCase(),
  tag: (product, value) => Array.isArray(product.tags) && product.tags.includes(value),
};

const CategoryPage = () => {
  const { persona, adapterId, pendingFilter, setPendingFilter, pinnedByCategory } = useApp();
  const pKey = personaKey(persona);
  const isAnon = !persona;
  const [products, setProducts] = useState([]);
  // The currently-loaded category. Defaults to the persona's primary category,
  // but a chat-driven applyFilter with facetId: 'category' will override this.
  // For anonymous users, default to hunting (the most catalog-dense category).
  const personaToDefaultCategory = { hunter: 'hunting', parent: 'team-sports', fitness: 'fitness' };
  const [activeCategory, setActiveCategory] = useState(personaToDefaultCategory[persona] || 'hunting');
  // activeFacets shape: { subcategory: Set, brand: Set, price: Set, category: Set?, tag: Set? }
  const [activeFacets, setActiveFacets] = useState({ subcategory: new Set(), brand: new Set(), price: new Set() });
  // Banner reflects the active category (not persona), with persona-aware sub-copy
  const banner = resolveCategoryBanner(activeCategory, persona);

  // Refetch products whenever the active category changes (e.g. chat asks for fitness)
  useEffect(() => {
    adapter.getProducts({ category: activeCategory }).then(setProducts);
  }, [adapterId, activeCategory]);

  // Apply LLM-issued filters when pendingFilter signal arrives
  useEffect(() => {
    if (!pendingFilter) return;
    // If the LLM asked us to switch category, update the active category instead
    // of just adding it as a filter facet. This re-fetches the right product set.
    if (pendingFilter.facetId === 'category') {
      setActiveCategory(pendingFilter.value);
      // Clear other facets when switching categories since they're category-specific
      setActiveFacets({ subcategory: new Set(), brand: new Set(), price: new Set() });
    } else {
      setActiveFacets(prev => {
        const next = { ...prev };
        const set = new Set(next[pendingFilter.facetId] || []);
        set.add(pendingFilter.value);
        next[pendingFilter.facetId] = set;
        return next;
      });
    }
    setPendingFilter(null);
  }, [pendingFilter, setPendingFilter]);

  // Apply filters then persona-driven sort
  const visibleProducts = useMemo(() => {
    if (!products.length) return [];
    // Filter: a product passes a facet group if it matches ANY selected value within that group (OR within group).
    // Across groups, all groups must pass (AND across groups). Empty group = no constraint.
    const filtered = products.filter(p => {
      for (const facetId of Object.keys(activeFacets)) {
        const selected = activeFacets[facetId];
        if (!selected || selected.size === 0) continue;
        const matcher = FACET_MATCHERS[facetId];
        if (!matcher) continue;
        let anyMatch = false;
        for (const value of selected) {
          if (matcher(p, value)) { anyMatch = true; break; }
        }
        if (!anyMatch) return false;
      }
      return true;
    });
    const sorted = [...filtered];
    if (persona === 'hunter') {
      sorted.sort((a, b) => (b.tags?.includes('premium') ? 1 : 0) - (a.tags?.includes('premium') ? 1 : 0) || b.price - a.price);
    } else if (persona === 'parent') {
      sorted.sort((a, b) => a.price - b.price);
    } else if (persona === 'fitness') {
      sorted.sort((a, b) => (b.compareAt ? b.compareAt - b.price : 0) - (a.compareAt ? a.compareAt - a.price : 0));
    } else {
      // Anonymous: sort by rating then review count (most-loved first). Neutral signal.
      sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0) || (b.reviews || 0) - (a.reviews || 0));
    }

    // Pin-aware reordering: any SKUs pinned via the Merch Tool for THIS category
    // float to the top of the grid, in the order they were pinned. This is what
    // makes admin pinning visible to shoppers on the storefront. We extract
    // pinned items (by SKU or product id) and put them at the front, then the
    // rest of the persona-sorted list follows.
    const pinList = (pinnedByCategory?.[activeCategory]) || [];
    if (pinList.length > 0) {
      const pinIndex = new Map();
      pinList.forEach((skuOrId, i) => pinIndex.set(skuOrId, i));
      const pinned = [];
      const rest = [];
      for (const p of sorted) {
        // A product is pinned if EITHER its sku or its id is in the pin list
        const order = pinIndex.has(p.sku) ? pinIndex.get(p.sku)
                    : pinIndex.has(p.id)  ? pinIndex.get(p.id)
                    : -1;
        if (order >= 0) pinned[order] = p;
        else rest.push(p);
      }
      // Compact the pinned array (some pin entries might not match any product)
      const compactPinned = pinned.filter(Boolean);
      return [...compactPinned, ...rest];
    }
    return sorted;
  }, [products, persona, activeFacets, pinnedByCategory, activeCategory]);

  // Persona-emphasized facet (only meaningful for hunter+hunting since Season is
  // hunting-specific; for other persona/category combos, emphasize Price as a sensible default)
  const emphFacet = (persona === 'hunter' && activeCategory === 'hunting')
    ? 'season'
    : persona ? 'price' : null;

  // Facets are derived dynamically from the actual loaded products. This way
  // each category surfaces only the brands and subcategories that are real for
  // it — no more "Crossbows" filter on the fitness page, no Vortex brand on
  // camping, no Season facet outside hunting.
  const facets = useMemo(() => {
    const subSet = new Set();
    const brandSet = new Set();
    for (const p of products) {
      if (p.subcategory) subSet.add(p.subcategory);
      if (p.brand) brandSet.add(p.brand);
    }
    // Title-case helper for displaying subcategory ids ("optics" → "Optics")
    const titleCase = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
    const derived = [
      { id: 'subcategory', name: 'Type', values: [...subSet].sort().map(titleCase), functional: true },
      { id: 'brand', name: 'Brand', values: [...brandSet].sort(), functional: true },
      { id: 'price', name: 'Price', values: ['Under $50', '$50–$200', '$200–$500', 'Over $500'], functional: true },
    ];
    // Season facet is hunting-only (uses tag values like 'deer-season' present
    // only in the hunting catalog). Only surface when browsing hunting.
    if (activeCategory === 'hunting') {
      derived.push({ id: 'season', name: 'Season', values: ['Deer', 'Turkey', 'Waterfowl', 'Small Game'], functional: false });
    }
    return derived;
  }, [products, activeCategory]);

  const toggleFacet = (facetId, value) => {
    setActiveFacets(prev => {
      const next = { ...prev };
      const set = new Set(next[facetId] || []);
      if (set.has(value)) set.delete(value); else set.add(value);
      next[facetId] = set;
      return next;
    });
  };

  const clearAll = () => setActiveFacets({ subcategory: new Set(), brand: new Set(), price: new Set() });

  const activeChips = useMemo(() => {
    const chips = [];
    for (const facetId of Object.keys(activeFacets)) {
      for (const value of (activeFacets[facetId] || [])) {
        chips.push({ facetId, value });
      }
    }
    return chips;
  }, [activeFacets]);

  // Live facet counts (how many products match if you add this value to current filters)
  const facetCounts = useMemo(() => {
    const counts = {};
    for (const facet of facets) {
      if (!facet.functional) continue;
      counts[facet.id] = {};
      for (const value of facet.values) {
        // Count products that would match if this value were added (assume single-value within the group).
        // We compute count under the constraint of OTHER groups only (typical e-commerce behavior).
        const hypothetical = products.filter(p => {
          for (const otherId of Object.keys(activeFacets)) {
            if (otherId === facet.id) continue;
            const sel = activeFacets[otherId];
            if (!sel || sel.size === 0) continue;
            const matcher = FACET_MATCHERS[otherId];
            if (!matcher) continue;   // unknown facet — don't constrain (and don't crash)
            let anyMatch = false;
            for (const v of sel) if (matcher(p, v)) { anyMatch = true; break; }
            if (!anyMatch) return false;
          }
          const ownMatcher = FACET_MATCHERS[facet.id];
          return ownMatcher ? ownMatcher(p, value) : true;
        });
        counts[facet.id][value] = hypothetical.length;
      }
    }
    return counts;
  }, [products, activeFacets]);

  return (
    <motion.div key={persona} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div style={{ background: banner.bg, color: T.text, padding: '64px 32px', position: 'relative', overflow: 'hidden', borderBottom: `1px solid ${T.hairline}` }}>
        <div style={{ position: 'absolute', inset: 0, background: banner.glow, pointerEvents: 'none' }} />
        <div className="grid-bg" style={{ position: 'absolute', inset: 0, opacity: 0.3, pointerEvents: 'none' }} />
        <div style={{ maxWidth: 1400, margin: '0 auto', position: 'relative' }}>
          <div className="mono" style={{ color: T.amber, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ width: 24, height: 1, background: T.amber }} />
            {(activeCategory || 'hunting').replace(/-/g, ' ').replace(/^./, c => c.toUpperCase())}
            {isAnon ? <> · Top-rated picks</> : <> › Personalized for {PERSONAS[pKey].name}</>}
          </div>
          <h1 className="display" style={{ fontSize: 68, margin: 0 }}>{banner.title}</h1>
          <p style={{ fontSize: 16, marginTop: 16, color: T.text2, maxWidth: 600 }}>{banner.sub}</p>
        </div>
      </div>

      <div style={{ maxWidth: 1400, margin: '0 auto', padding: 32, display: 'grid', gridTemplateColumns: '260px 1fr', gap: 40 }}>
        <aside>
          <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div className="mono" style={{ display: 'flex', alignItems: 'center', gap: 8, color: T.text2 }}><Filter size={12} /> Filters</div>
            {activeChips.length > 0 && (
              <button onClick={clearAll} style={{ background: 'none', border: 0, color: T.red, fontSize: 11, fontWeight: 600, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: 0.5 }}>Clear all</button>
            )}
          </div>
          {facets.map(f => (
            <FacetGroup
              key={f.id}
              facet={f}
              emphasized={f.id === emphFacet}
              selectedSet={activeFacets[f.id] || new Set()}
              counts={facetCounts[f.id]}
              onToggle={(v) => toggleFacet(f.id, v)}
            />
          ))}
        </aside>
        <main>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16, paddingBottom: 18, borderBottom: `1px solid ${T.hairline}` }}>
            <div style={{ fontSize: 13, color: T.text2 }}>
              <span style={{ color: T.text, fontWeight: 600 }}>{visibleProducts.length}</span> {visibleProducts.length === 1 ? 'product' : 'products'}
              {activeChips.length === 0 && (
                isAnon
                  ? <> · sorted by <span style={{ color: T.cyan, fontWeight: 600 }}>top-rated</span></>
                  : <> · sorted for <span style={{ color: T.cyan, fontWeight: 600 }}>{PERSONAS[pKey].name}</span></>
              )}
              {activeChips.length > 0 && <> · {activeChips.length} {activeChips.length === 1 ? 'filter' : 'filters'} applied</>}
            </div>
            <button style={{ background: 'rgba(15,23,42,0.05)', border: `1px solid ${T.hairline}`, color: T.text2, padding: '8px 14px', fontSize: 12, cursor: 'pointer', borderRadius: 4 }}>Sort: Personalized ▾</button>
          </div>

          {/* Active filter chips */}
          <AnimatePresence>
            {activeChips.length > 0 && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ marginBottom: 22, display: 'flex', gap: 8, flexWrap: 'wrap', overflow: 'hidden' }}>
                {activeChips.map(chip => (
                  <motion.button
                    key={`${chip.facetId}-${chip.value}`}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    onClick={() => toggleFacet(chip.facetId, chip.value)}
                    style={{
                      background: 'rgba(25,70,200,0.1)',
                      color: T.cyan,
                      border: `1px solid ${T.cyan}44`,
                      padding: '6px 10px 6px 12px',
                      borderRadius: 999, fontSize: 12, fontWeight: 500,
                      display: 'inline-flex', alignItems: 'center', gap: 8,
                      cursor: 'pointer',
                    }}
                  >
                    <span style={{ color: T.amber, fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>{chip.facetId === 'subcategory' ? 'Type' : chip.facetId}</span>
                    {chip.value}
                    <X size={12} />
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {visibleProducts.length === 0 ? (
            <div style={{ padding: '80px 20px', textAlign: 'center', background: T.ink2, border: `1px solid ${T.hairline}`, borderRadius: 8 }}>
              <div style={{ fontSize: 48, marginBottom: 12, opacity: 0.4 }}>🔍</div>
              <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 6, color: T.text }}>No products match those filters</div>
              <div style={{ fontSize: 13, color: T.text2, marginBottom: 20 }}>Try removing a filter or broadening your selection.</div>
              <button onClick={clearAll} style={{ background: T.cyan, color: T.void, border: 0, padding: '12px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer', borderRadius: 4 }}>Clear all filters</button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
              <AnimatePresence mode="popLayout">
                {visibleProducts.map(p => {
                  // A product is pinned if its sku or id appears in the merch
                  // pin list for the active category. Used to show a "Featured"
                  // badge and violet glow border on the card.
                  const pinList = (pinnedByCategory?.[activeCategory]) || [];
                  const isPinned = pinList.includes(p.sku) || pinList.includes(p.id);
                  return (
                  <motion.div
                    key={p.id}
                    layout
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ProductCard product={p} compact pinned={isPinned} />
                  </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </main>
      </div>
    </motion.div>
  );
};

const FacetGroup = ({ facet, emphasized, selectedSet, counts, onToggle }) => {
  const [open, setOpen] = useState(emphasized || (selectedSet && selectedSet.size > 0));
  const isFunctional = facet.functional;
  const activeCount = selectedSet?.size || 0;
  return (
    <div style={{
      marginBottom: 6,
      background: emphasized ? 'rgba(212,161,78,0.08)' : 'transparent',
      padding: emphasized ? 14 : '12px 0',
      borderRadius: emphasized ? 6 : 0,
      border: emphasized ? `1px solid ${T.amber}44` : 0,
      transition: 'background 0.2s',
    }}>
      <button onClick={() => setOpen(o => !o)} style={{
        background: 'none', border: 0, width: '100%',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        cursor: 'pointer', padding: '4px 0',
        fontSize: 13, fontWeight: 600, color: T.text,
      }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {facet.name}
          {emphasized && <Sparkles size={12} color={T.amber} />}
          {activeCount > 0 && (
            <span style={{ background: T.cyan, color: T.void, fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 999, minWidth: 16, textAlign: 'center' }}>{activeCount}</span>
          )}
        </span>
        <ChevronDown size={14} style={{ transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s', color: T.text2 }} />
      </button>
      {open && (
        <div style={{ marginTop: 10 }}>
          {facet.values.map(v => {
            const checked = selectedSet?.has(v) || false;
            const count = counts?.[v];
            const disabled = !isFunctional || (count === 0 && !checked);
            return (
              <label
                key={v}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '6px 0',
                  fontSize: 12,
                  color: checked ? T.cyan : T.text2,
                  cursor: disabled ? 'not-allowed' : 'pointer',
                  opacity: disabled ? 0.3 : 1,
                  transition: 'opacity 0.15s, color 0.15s',
                }}
              >
                <input
                  type="checkbox"
                  disabled={disabled}
                  checked={checked}
                  onChange={() => isFunctional && onToggle(v)}
                  style={{ accentColor: T.cyan, cursor: disabled ? 'not-allowed' : 'pointer' }}
                />
                <span style={{ flex: 1 }}>{v}</span>
                {isFunctional && count !== undefined && (
                  <span style={{ color: T.text3, fontSize: 11 }}>({count})</span>
                )}
              </label>
            );
          })}
          {!isFunctional && <div className="mono" style={{ color: T.text3, marginTop: 8, fontSize: 9 }}>Coming soon · needs season metadata</div>}
        </div>
      )}
    </div>
  );
};

/* ============================================================================
   PRODUCT DETAIL PAGE — with provenance labels
   ============================================================================ */
const PDP_CONTENT = {
  hunter: { product: 'h001', personaModule: { title: 'Pairs With Your Blind Setup', items: ['h002', 'h006', 'h008'] } },
  parent: { product: 't001', personaModule: { title: 'Team Bundle Savings — Save $18', items: ['t002', 't003', 't004'] } },
  fitness: { product: 'f001', personaModule: { title: 'Built For Your Stride', items: ['f002', 'f003', 'f005'] } },
  // Guest: no persona module shown (handled by render check). The product field
  // is a safe hero SKU shown if no specific product was selected.
  guest: { product: 'h001', personaModule: null },
};

const PDPPage = () => {
  const { persona, activeProduct, setView, addToCart, removeFromCart, cart, adapterId, setPendingFilter, pdpOverrides, shopifySession } = useApp();
  const [product, setProduct] = useState(null);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  // Delivery promise — live per-location stock vs. the persona's home store (zip).
  // Mirrors Kit Builder's pattern. Mock adapter returns null and we omit the line.
  const [delivery, setDelivery] = useState(null);
  const customerZip = shopifySession?.profile?.address?.zip || '77024';
  const homeStore = zipToStore(customerZip);
  const pKey = personaKey(persona);
  const isAnon = !persona;
  // Default to persona's hero SKU if no specific product set
  const targetId = activeProduct || PDP_CONTENT[pKey].product;
  useEffect(() => {
    adapter.getProduct(targetId).then(p => {
      setProduct(p);
      setActivePhotoIdx(0);   // reset gallery to first image when product changes
    });
  }, [targetId, adapterId]);
  // Live inventory by location for the delivery promise. Refetches when the
  // product or adapter changes; silently no-ops on Mock (returns null).
  useEffect(() => {
    let cancelled = false;
    setDelivery(null);
    if (typeof adapter.getInventoryByLocation !== 'function') return;
    (async () => {
      try {
        const inv = await adapter.getInventoryByLocation(targetId);
        if (cancelled) return;
        const promise = deliveryPromise(inv, homeStore);
        if (promise) setDelivery(promise);
      } catch { /* omit promise on error */ }
    })();
    return () => { cancelled = true; };
  }, [targetId, adapterId, homeStore?.id]);
  if (!product) return <div style={{ padding: 80, textAlign: 'center', color: T.text2 }}>Loading…</div>;

  // PDP personalized module — base from constants, overlay any admin override.
  // Override shape: { title?: string, items?: [productIds] }. Either field may
  // be set independently — admin might edit only the title or only the SKUs.
  const baseModule = PDP_CONTENT[pKey].personaModule;
  const override = pdpOverrides?.[pKey];
  const personaModule = baseModule
    ? {
        title: override?.title || baseModule.title,
        items: (override?.items && override.items.length > 0) ? override.items : baseModule.items,
      }
    : (override && (override.title || (override.items && override.items.length > 0)))
      // No base module (e.g. guest persona has personaModule: null), but admin
      // configured one for this persona — show the override as a standalone module.
      ? {
          title: override.title || 'Featured for you',
          items: override.items || [],
        }
      : null;
  const photos = getProductPhotos(product);
  const heroPhoto = photos[activePhotoIdx] || product.photo;

  return (
    <motion.div key={product.id + pKey} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '32px 32px 80px' }}>
        <div className="mono" style={{ color: T.text3, marginBottom: 28 }}>
          <button onClick={() => {
            setView('category');
            // Navigate the category page to this product's actual category
            if (product.category) {
              setPendingFilter({ facetId: 'category', value: product.category, _t: Date.now() });
            }
          }} style={{ background: 'none', border: 0, color: T.text3, cursor: 'pointer', fontSize: 'inherit', letterSpacing: 'inherit', textTransform: 'inherit' }}>
            ← {(CATEGORY_LIST.find(c => c.id === product.category)?.label) || 'Shop'}
          </button> / <span style={{ color: T.amber }}>{product.brand}</span>
        </div>

        {/* Gallery + Spec block */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 60, marginBottom: 60 }}>
          <PDPModule source="DAM">
            <motion.div
              key={`hero-${activePhotoIdx}`}
              initial={{ opacity: 0.5 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.25 }}
              style={{ aspectRatio: '1', overflow: 'hidden', borderRadius: 8, border: `1px solid ${T.hairline}` }}
            >
              <ProductIllustration product={product} photoUrl={heroPhoto} />
            </motion.div>
            <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
              {photos.map((photoUrl, i) => (
                <button
                  key={i}
                  onClick={() => setActivePhotoIdx(i)}
                  style={{
                    flex: 1, aspectRatio: '1', overflow: 'hidden', cursor: 'pointer',
                    borderRadius: 4,
                    border: i === activePhotoIdx ? `1px solid ${T.cyan}` : `1px solid ${T.hairline}`,
                    opacity: i === activePhotoIdx ? 1 : 0.55,
                    boxShadow: i === activePhotoIdx ? `0 0 16px ${T.cyan}33` : 'none',
                    background: 'transparent',
                    padding: 0,
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => {
                    if (i !== activePhotoIdx) {
                      e.currentTarget.style.opacity = '0.85';
                      e.currentTarget.style.borderColor = `${T.cyan}88`;
                    }
                  }}
                  onMouseLeave={e => {
                    if (i !== activePhotoIdx) {
                      e.currentTarget.style.opacity = '0.55';
                      e.currentTarget.style.borderColor = T.hairline;
                    }
                  }}
                >
                  <ProductIllustration product={product} photoUrl={photoUrl} size="thumb" />
                </button>
              ))}
            </div>
          </PDPModule>

          <PDPModule source="PIM">
            <div className="mono" style={{ color: T.amber, marginBottom: 14 }}>{product.brand} · SKU {product.sku}</div>
            <h1 className="display" style={{ fontSize: 46, margin: 0, lineHeight: 1.05, color: T.text }}>{product.name}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 18 }}>
              <Star size={14} fill={T.amber} stroke={T.amber} />
              <span style={{ fontSize: 14, color: T.text }}>{product.rating}</span>
              <span style={{ color: T.text3, fontSize: 13 }}>({product.reviews} reviews)</span>
            </div>
            <div style={{ marginTop: 32, display: 'flex', alignItems: 'baseline', gap: 14 }}>
              <span style={{ fontSize: 40, fontWeight: 700, color: T.text }}>${product.price.toFixed(2)}</span>
              {product.compareAt && <span style={{ color: T.text3, textDecoration: 'line-through', fontSize: 18 }}>${product.compareAt.toFixed(2)}</span>}
            </div>
            {product.spec && (
              <div style={{ marginTop: 36, paddingTop: 24, borderTop: `1px solid ${T.hairline}` }}>
                <div className="mono" style={{ color: T.text3, marginBottom: 14 }}>Specifications</div>
                {Object.entries(product.spec).map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px dashed ${T.hairline}`, fontSize: 13 }}>
                    <span style={{ color: T.text3, textTransform: 'capitalize' }}>{k}</span>
                    <span style={{ fontWeight: 500, color: T.text }}>{v}</span>
                  </div>
                ))}
              </div>
            )}
            {/* Delivery promise — driven by the persona's stored Shopify address (zip → home store). */}
            {delivery && (() => {
              const toneColor = delivery.tone === 'good' ? T.lime : delivery.tone === 'ok' ? T.amber : T.red;
              return (
                <div style={{
                  marginTop: 28,
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '11px 14px',
                  background: `${toneColor}10`,
                  border: `1px solid ${toneColor}44`,
                  borderRadius: 12,
                  fontSize: 13, fontFamily: T.mono, color: toneColor,
                }}>
                  <MapPin size={14} />
                  <span style={{ color: T.text }}>{delivery.label}</span>
                  {homeStore?.zip && <span style={{ color: T.text3, marginLeft: 'auto', fontSize: 11 }}>· based on {homeStore.zip}</span>}
                </div>
              );
            })()}

            {/* Add to Cart / Remove — flips when this product is already in the cart. */}
            {(() => {
              const cartLine = cart?.find(i => i.product?.id === product.id) || null;
              const inCart = !!cartLine;
              if (!inCart) {
                return (
                  <button onClick={() => addToCart(product, 1)} style={{
                    marginTop: 18, width: '100%',
                    background: T.gradHero, color: 'white',
                    border: 0, padding: '20px 28px',
                    fontWeight: 700, fontSize: 14,
                    cursor: 'pointer', letterSpacing: 1,
                    borderRadius: 999,
                    boxShadow: `0 8px 32px ${T.violet}55, 0 0 60px ${T.pink}33, inset 0 1px 0 rgba(255,255,255,0.25)`,
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 12px 48px ${T.violet}77, 0 0 80px ${T.pink}55, inset 0 1px 0 rgba(255,255,255,0.3)`; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = `0 8px 32px ${T.violet}55, 0 0 60px ${T.pink}33, inset 0 1px 0 rgba(255,255,255,0.25)`; e.currentTarget.style.transform = 'translateY(0)'; }}
                  >
                    ADD TO CART — ${product.price.toFixed(2)}
                  </button>
                );
              }
              // In cart: primary becomes "View cart", with a Remove text-button beneath.
              return (
                <div style={{ marginTop: 18 }}>
                  <button onClick={() => setView('cart')} style={{
                    width: '100%',
                    background: `linear-gradient(135deg, ${T.lime}, ${T.cyan})`, color: '#0a0a0f',
                    border: 0, padding: '20px 28px',
                    fontWeight: 700, fontSize: 14,
                    cursor: 'pointer', letterSpacing: 1,
                    borderRadius: 999,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                    boxShadow: `0 8px 32px ${T.lime}44, 0 0 60px ${T.cyan}22, inset 0 1px 0 rgba(255,255,255,0.25)`,
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
                  >
                    <Check size={16} /> IN CART · {cartLine.qty} ADDED — VIEW CART <ArrowRight size={16} />
                  </button>
                  <button
                    onClick={() => removeFromCart(product.id)}
                    style={{
                      marginTop: 10, width: '100%',
                      background: 'transparent', color: T.text3,
                      border: `1px solid ${T.hairline}`, padding: '10px 16px',
                      fontSize: 12, fontWeight: 600, letterSpacing: 1,
                      cursor: 'pointer', borderRadius: 999,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.color = T.red; e.currentTarget.style.borderColor = `${T.red}66`; }}
                    onMouseLeave={e => { e.currentTarget.style.color = T.text3; e.currentTarget.style.borderColor = T.hairline; }}
                  >
                    <X size={12} /> REMOVE FROM CART
                  </button>
                </div>
              );
            })()}
          </PDPModule>
        </div>

        {/* Feature highlights */}
        <PDPModule source="AI-generated" label="Why customers love this">
          <h2 className="display" style={{ fontSize: 34, margin: '0 0 28px', color: T.text }}>Feature Highlights</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {[
              { icon: <Target size={20} />, title: 'Built for precision', body: 'Engineered to deliver consistent performance in the conditions you actually hunt in.' },
              { icon: <Zap size={20} />, title: 'Field-tested durability', body: 'Tested by our pro staff across multiple seasons — designed to outlast the gear it replaces.' },
              { icon: <Flame size={20} />, title: 'Customer-loved', body: `Top-rated in its category with ${product.reviews}+ reviews and a ${product.rating}-star average.` },
            ].map((f, i) => (
              <div key={i} style={{ padding: 24, background: T.ink2, border: `1px solid ${T.hairline}`, borderRadius: 8 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: '50%',
                  background: 'rgba(25,70,200,0.12)',
                  border: `1px solid ${T.cyan}44`,
                  color: T.cyan,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 18,
                }}>{f.icon}</div>
                <div style={{ fontWeight: 600, marginBottom: 8, color: T.text }}>{f.title}</div>
                <div style={{ fontSize: 13, color: T.text2, lineHeight: 1.55 }}>{f.body}</div>
              </div>
            ))}
          </div>
        </PDPModule>

        {/* Persona-driven module — hidden for anonymous (no signal) */}
        {personaModule && (
          <PDPModule source="AI-generated" label={`Personalized for ${PERSONAS[pKey].name}`}>
            <h2 className="display" style={{ fontSize: 34, margin: '0 0 24px', color: T.cyan }}>{personaModule.title}</h2>
            <PersonaModuleProducts ids={personaModule.items} />
          </PDPModule>
        )}

        {/* Cross-sell — also hidden for anonymous since it depends on persona */}
        {!isAnon && (
          <PDPModule source="AI-generated" label="Personalized · Cross-sell">
            <h2 className="display" style={{ fontSize: 34, margin: '0 0 24px', color: T.text }}>You Might Also Need</h2>
            <PersonaModuleProducts ids={persona === 'hunter' ? ['h005', 'h007', 'h006'] : persona === 'parent' ? ['t004', 't005', 't006'] : ['f004', 'f005', 'f006']} />
          </PDPModule>
        )}

        {/* For anonymous users with no admin override, show the sign-in callout.
            If the admin configured a PDP module for guests, that takes priority
            (rendered via the personaModule block above). */}
        {isAnon && !personaModule && (
          <PDPModule source="System" label="Personalization">
            <div style={{ padding: '32px 8px', textAlign: 'center' }}>
              <div style={{ fontSize: 42, marginBottom: 16 }}>✨</div>
              <h2 className="display" style={{ fontSize: 28, margin: '0 0 12px', color: T.text }}>
                Sign in for personalized picks
              </h2>
              <p style={{ color: T.text2, fontSize: 14, maxWidth: 480, margin: '0 auto' }}>
                Once you sign in, this section shows recommendations tailored to your interests and past activity.
              </p>
            </div>
          </PDPModule>
        )}

        {/* Reviews */}
        <PDPModule source="PIM" label="Customer Reviews">
          <h2 className="display" style={{ fontSize: 34, margin: '0 0 24px', color: T.text }}>What Customers Are Saying</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
            {[
              { name: 'Mike T.', stars: 5, body: 'Outstanding clarity and the windage adjustments are precise. Mounted on my .308 and zero held perfectly after 100 rounds.' },
              { name: 'Sarah K.', stars: 5, body: 'Worth every penny. The glass is sharper than scopes I\'ve used at twice the price.' },
            ].map((r, i) => (
              <div key={i} style={{ padding: 22, background: T.ink2, border: `1px solid ${T.hairline}`, borderRadius: 8 }}>
                <div style={{ display: 'flex', gap: 2, marginBottom: 10 }}>
                  {Array.from({ length: r.stars }).map((_, j) => <Star key={j} size={12} fill={T.amber} stroke={T.amber} />)}
                </div>
                <div style={{ fontSize: 13, lineHeight: 1.55, marginBottom: 14, color: T.text }}>"{r.body}"</div>
                <div className="mono" style={{ color: T.text3 }}>{r.name} · Verified buyer</div>
              </div>
            ))}
          </div>
        </PDPModule>
      </div>
    </motion.div>
  );
};

const PDPModule = ({ source, label, children }) => {
  const colors = {
    PIM: { bg: 'rgba(25,70,200,0.1)', text: T.cyan },
    DAM: { bg: 'rgba(212,161,78,0.12)', text: T.amber },
    'AI-generated': { bg: 'rgba(22,163,74,0.1)', text: T.green },
  };
  const c = colors[source];
  return (
    <div style={{ marginBottom: 60, position: 'relative' }}>
      {children}
      <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 10, fontSize: 10 }}>
        <span className="mono" style={{
          padding: '4px 10px',
          background: c.bg, color: c.text,
          border: `1px solid ${c.text}44`,
          borderRadius: 2, fontWeight: 600,
        }}>
          from {source}
        </span>
        {label && <span style={{ color: T.text3 }}>{label}</span>}
      </div>
    </div>
  );
};

const PersonaModuleProducts = ({ ids }) => {
  const { adapterId } = useApp();
  const [items, setItems] = useState([]);
  useEffect(() => { Promise.all(ids.map(id => adapter.getProduct(id))).then(setItems); }, [ids.join('|'), adapterId]);
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
      {items.filter(Boolean).map(p => <ProductCard key={p.id} product={p} compact />)}
    </div>
  );
};

/* ============================================================================
   CHAT WIDGET — Floating AI assistant
   Always-visible bubble bottom-right; expands into a multi-turn chat panel.
   Replaces the old SearchOverlay. Routes search and visual search via the
   adapter. Includes shortcuts for the locked stage queries and kit builder.
   ============================================================================ */

// Trim a product title to a short, chip-friendly phrase (first 2-3 meaningful words).
function shortName(title) {
  if (!title) return 'gear';
  const words = title.split(/\s+/).filter(Boolean);
  // Drop a leading brand-ish word if the title is long, keep it readable.
  const core = words.slice(0, 3).join(' ');
  return core.length > 28 ? words.slice(0, 2).join(' ') : core;
}

const CHAT_SUGGESTIONS = [
  { label: 'Find me a beginner crossbow under $400', icon: <Target size={12} /> },
  { label: 'Running shoes for flat feet', icon: <Zap size={12} /> },
  { label: 'Youth soccer cleats size 4', icon: <Flame size={12} /> },
  { label: 'Show me a fishing kayak under $1000', icon: <Sparkles size={12} /> },
  { label: 'Open the Vortex scope and add 1 to my cart', icon: <ShoppingCart size={12} /> },
  { label: 'Take me to checkout', icon: <ArrowRight size={12} /> },
];

const ChatWidget = () => {
  const { setView, setActiveProduct, persona, view, cart, addToCart, executeActions, llmEnabled, chatOpen: open, setChatOpen: setOpen, shopifyOrders } = useApp();

  // Personalize the welcome + suggestion chips from the persona's real Shopify
  // order history (when a live session is loaded). Falls back to the generic
  // greeting + default chips on Mock / guest / before the session resolves.
  const { welcomeText, chips } = useMemo(() => {
    const orders = shopifyOrders || [];
    const pName = PERSONAS[persona]?.name;
    if (orders.length === 0 || !pName) {
      return {
        welcomeText: "Hi — I'm your AI shopping assistant. Ask me anything in plain English — I can find products, open pages, add to cart, even check you out. Try the suggestions below.",
        chips: CHAT_SUGGESTIONS,
      };
    }
    // Gather recent purchases for a tailored greeting.
    const allItems = orders.flatMap(o => o.items.map(i => ({ ...i, daysAgo: o.daysAgo })));
    const recent = allItems[0];
    const itemCount = orders.reduce((s, o) => s + o.items.reduce((n, i) => n + (i.quantity || 1), 0), 0);
    const lifetime = orders.reduce((s, o) => s + (o.total || 0), 0);

    const welcome = `Welcome back, ${pName}. I can see your ${orders.length} past orders (${itemCount} items, $${lifetime.toFixed(2)} lifetime)${recent ? ` — most recently the ${recent.title}` : ''}. Ask me what pairs with your gear, what to restock, or what's next.`;

    // Build personalized chips grounded in real purchases.
    const personalChips = [];
    if (recent) {
      personalChips.push({ label: `What pairs with my ${shortName(recent.title)}?`, icon: <Sparkles size={12} /> });
    }
    personalChips.push({ label: 'What should I buy next based on my orders?', icon: <Target size={12} /> });
    // Category-aware follow-up from their most-bought category.
    const catCount = {};
    allItems.forEach(i => { if (i.category) catCount[i.category] = (catCount[i.category] || 0) + 1; });
    const topCat = Object.keys(catCount).sort((a, b) => catCount[b] - catCount[a])[0];
    if (topCat) {
      personalChips.push({ label: `Show me new ${topCat.replace('-', ' ')} arrivals`, icon: <Flame size={12} /> });
    }
    if (allItems.length > 1) {
      const second = allItems[1];
      personalChips.push({ label: `Restock my ${shortName(second.title)}`, icon: <ShoppingCart size={12} /> });
    }
    personalChips.push({ label: 'Take me to checkout', icon: <ArrowRight size={12} /> });
    return { welcomeText: welcome, chips: personalChips.slice(0, 5) };
  }, [shopifyOrders, persona]);

  const [messages, setMessages] = useState([
    { role: 'assistant', kind: 'welcome', text: welcomeText },
  ]);

  // Keep the welcome message in sync once the Shopify session loads (the
  // initial state is captured at mount, before orders may have arrived). Only
  // updates while the chat is still fresh (single welcome message, untouched).
  useEffect(() => {
    setMessages(prev => {
      if (prev.length === 1 && prev[0].kind === 'welcome' && prev[0].text !== welcomeText) {
        return [{ role: 'assistant', kind: 'welcome', text: welcomeText }];
      }
      return prev;
    });
  }, [welcomeText]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [visualOpen, setVisualOpen] = useState(false);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll on new message
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  // Focus input when opened
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 200);
  }, [open]);

  const sendMessage = async (text) => {
    if (!text.trim()) return;
    if (loading) return;   // prevent concurrent requests
    const userMsg = { role: 'user', kind: 'text', text };
    const history = messages.filter(m => m.text && (m.kind === 'text' || m.kind === 'welcome' || m.kind === 'results'));
    setMessages(m => [...m, userMsg]);
    setInput('');
    setLoading(true);

    // Call LLM (or fallback scripts) with full state context
    const state = { persona, view, cart, purchaseHistory: shopifyOrders || [] };
    const response = await callLLM(text, state, history);
    setLoading(false);

    // Extract showResults action specifically since it renders inline in chat
    const showResultsAction = response.actions?.find(a => a.type === 'showResults');
    let chatResults = null;
    if (showResultsAction) {
      const ids = showResultsAction.ids || [];
      const reasons = showResultsAction.reasons || [];
      // Resolve each ID and pair with its corresponding reason BEFORE filtering nulls,
      // so reasons stay aligned with their intended products.
      const productsWithReasons = await Promise.all(
        ids.map((id, i) => adapter.getProduct(id).then(p => ({ product: p, reason: reasons[i] || 'Recommended for you' })))
      );
      chatResults = productsWithReasons.filter(x => x.product);
    }

    setMessages(m => [
      ...m,
      {
        role: 'assistant',
        kind: chatResults ? 'results' : 'text',
        text: response.message,
        results: chatResults,
      },
    ]);

    // Execute all other actions on the storefront (navigate, addToCart, etc.)
    const nonInlineActions = (response.actions || []).filter(a => a.type !== 'showResults');
    if (nonInlineActions.length > 0) {
      // Slight delay so user reads the message first
      setTimeout(() => executeActions(nonInlineActions), 500);
    }
  };

  const handleVisualResults = ({ identified, products, previewUrl, usedFallback }) => {
    setMessages(m => [
      ...m,
      { role: 'user', kind: 'image-uploaded', label: 'Image uploaded', preview: previewUrl },
      {
        role: 'assistant',
        kind: 'results',
        // If Claude identified the image, surface its description.
        // If we fell back, the identified text already says so honestly.
        text: identified
          ? (usedFallback ? identified : `${identified}${products.length ? ` — here are the closest matches:` : ''}`)
          : `Here are the top ${products.length} visually similar products:`,
        results: products,
      },
    ]);
    setVisualOpen(false);
  };

  const handleKitShortcut = () => {
    setView('kit');   // chat stays open — page navigates underneath
  };

  // Mouse-tracked tilt for the orb (magnetic feel)
  const [orbTilt, setOrbTilt] = useState({ x: 0, y: 0, scale: 1 });
  const orbRef = useRef(null);

  useEffect(() => {
    if (open) return;
    const handleMouseMove = (e) => {
      if (!orbRef.current) return;
      const rect = orbRef.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      // Magnetic radius: 200px → pull strongly; further away → no effect
      const radius = 200;
      if (dist < radius) {
        const pull = (radius - dist) / radius;            // 0..1
        setOrbTilt({
          x: (dx / radius) * 14 * pull,                    // px translate
          y: (dy / radius) * 14 * pull,
          scale: 1 + pull * 0.08,
        });
      } else {
        setOrbTilt({ x: 0, y: 0, scale: 1 });
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [open]);

  return (
    <>
      {/* FLOATING GLASSMORPHIC ORB */}
      <AnimatePresence>
        {!open && (
          <motion.div
            key="orb-wrapper"
            ref={orbRef}
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: orbTilt.scale,
              opacity: 1,
              x: orbTilt.x,
              y: orbTilt.y,
            }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', damping: 18, stiffness: 220 }}
            style={{
              position: 'fixed', bottom: 28, right: 28, zIndex: 100,
              width: 72, height: 72,
              cursor: 'pointer',
            }}
            onClick={() => setOpen(true)}
            aria-label="Open AI assistant"
          >
            {/* Outer glow halo — pulses */}
            <div className="orb-breathe" style={{
              position: 'absolute', inset: -10,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${T.violet}66 0%, ${T.pink}44 40%, transparent 70%)`,
              filter: 'blur(12px)',
              pointerEvents: 'none',
            }} />

            {/* Glass orb body */}
            <div style={{
              position: 'absolute', inset: 0,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.10)',
              backdropFilter: 'blur(20px) saturate(180%)',
              WebkitBackdropFilter: 'blur(20px) saturate(180%)',
              border: `1px solid ${T.glassBorderHi}`,
              overflow: 'hidden',
              boxShadow: `
                0 8px 32px rgba(25,70,200,0.4),
                0 4px 16px rgba(200,16,46,0.3),
                inset 0 1px 0 rgba(255,255,255,0.3),
                inset 0 -1px 0 rgba(0,0,0,0.2)
              `,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {/* Swirling gradient interior */}
              <div className="orb-swirl" style={{
                position: 'absolute', inset: 0,
                background: `
                  conic-gradient(
                    from 0deg,
                    ${T.violet}aa,
                    ${T.pink}aa,
                    ${T.amber}aa,
                    ${T.cyan}aa,
                    ${T.violet}aa
                  )
                `,
                opacity: 0.6,
                filter: 'blur(4px)',
              }} />

              {/* Glass highlight (top-left specular) */}
              <div style={{
                position: 'absolute', top: '12%', left: '18%',
                width: '40%', height: '30%',
                borderRadius: '50%',
                background: 'radial-gradient(ellipse, rgba(255,255,255,0.45) 0%, transparent 70%)',
                pointerEvents: 'none',
              }} />

              {/* Sparkle icon on top */}
              <div style={{
                position: 'relative', zIndex: 2,
                color: 'white',
                filter: 'drop-shadow(0 2px 4px rgba(15,23,42,0.12))',
                display: 'flex',
              }}>
                <Sparkles size={26} strokeWidth={2.2} />
              </div>
            </div>

            {/* Floating label */}
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              style={{
                position: 'absolute', right: 'calc(100% + 16px)', top: '50%',
                transform: 'translateY(-50%)',
                background: 'rgba(255,255,255,0.92)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                color: T.text,
                padding: '8px 14px',
                borderRadius: 999,
                fontSize: 12, fontWeight: 500,
                whiteSpace: 'nowrap',
                border: `1px solid ${T.glassBorder}`,
                boxShadow: '0 4px 16px rgba(15,23,42,0.16)',
                pointerEvents: 'none',
              }}>
              <span className="shimmer-text" style={{ fontWeight: 600 }}>Ask AI</span>
              <span style={{ color: T.text2, marginLeft: 6 }}>· find anything</span>
              <span style={{
                position: 'absolute', left: '100%', top: '50%', transform: 'translateY(-50%)',
                width: 0, height: 0,
                borderTop: '6px solid transparent', borderBottom: '6px solid transparent',
                borderLeft: `6px solid rgba(255,255,255,0.92)`,
              }} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CHAT PANEL */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: 'spring', damping: 24, stiffness: 280 }}
            style={{
              position: 'fixed', bottom: 24, right: 24, zIndex: 200,
              width: 'min(420px, calc(100vw - 48px))',
              height: 'min(720px, calc(100vh - 60px))',
              borderRadius: 20,
              overflow: 'hidden',
              display: 'flex', flexDirection: 'column',
              background: 'rgba(255,255,255,0.92)',
              backdropFilter: 'blur(32px) saturate(180%)',
              WebkitBackdropFilter: 'blur(32px) saturate(180%)',
              border: `1px solid ${T.glassBorderHi}`,
              boxShadow: `
                0 24px 80px rgba(15,23,42,0.15),
                0 0 0 1px ${T.violet}33,
                0 0 80px ${T.violet}22,
                inset 0 1px 0 rgba(255,255,255,0.1)
              `,
            }}
          >
            {/* Header */}
            <div style={{
              padding: '18px 20px',
              borderBottom: `1px solid ${T.hairline}`,
              display: 'flex', alignItems: 'center', gap: 12,
              background: `linear-gradient(180deg, ${T.violet}22 0%, transparent 100%)`,
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: '50%',
                background: T.gradAI,
                color: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: `0 0 20px ${T.violet}66, inset 0 1px 0 rgba(255,255,255,0.3)`,
                position: 'relative',
                overflow: 'hidden',
              }}>
                <div className="orb-swirl" style={{
                  position: 'absolute', inset: 0,
                  background: `conic-gradient(from 0deg, ${T.violet}aa, ${T.pink}aa, ${T.cyan}aa, ${T.violet}aa)`,
                  opacity: 0.5,
                }} />
                <Sparkles size={18} strokeWidth={2.2} style={{ position: 'relative', zIndex: 1 }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14, color: T.text, display: 'flex', alignItems: 'center', gap: 6 }}>
                  AI Assistant
                  {llmEnabled && (
                    <span style={{
                      fontSize: 9, fontWeight: 700, letterSpacing: 0.5,
                      padding: '2px 6px', borderRadius: 4,
                      background: T.gradAI, color: 'white',
                    }}>AI AGENT</span>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: T.text2 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: T.lime, boxShadow: `0 0 8px ${T.lime}` }} />
                  {llmEnabled ? 'A2UI · live · can drive the page' : 'A2UI · scripted demo mode'}
                </div>
              </div>
              <button
                onClick={() => setView('cart')}
                title="View cart"
                style={{
                  background: cart.length > 0 ? T.gradAI : T.glassSurface,
                  border: `1px solid ${cart.length > 0 ? T.violet + '66' : T.glassBorder}`,
                  color: cart.length > 0 ? 'white' : T.text2,
                  height: 32, padding: '0 10px', borderRadius: 8,
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 6,
                  fontSize: 11, fontWeight: 600,
                  boxShadow: cart.length > 0 ? `0 0 12px ${T.violet}44` : 'none',
                  transition: 'all 0.2s',
                }}>
                <ShoppingCart size={13} />
                {cart.length > 0 && cart.length}
              </button>
              <button onClick={() => setOpen(false)} style={{
                background: T.glassSurface,
                border: `1px solid ${T.glassBorder}`,
                color: T.text2,
                width: 32, height: 32, borderRadius: 8,
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <X size={14} />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} style={{
              flex: 1, overflowY: 'auto',
              padding: '20px',
              display: 'flex', flexDirection: 'column', gap: 14,
              scrollBehavior: 'smooth',
            }} className="scroll-x">
              {messages.map((msg, i) => (
                <ChatMessage
                  key={i}
                  msg={msg}
                  onProductClick={(id) => {
                    setActiveProduct(id);
                    setView('pdp');
                    // chat stays open
                  }}
                  onAddToCart={(product) => {
                    addToCart(product, 1);
                    setMessages(m => [
                      ...m,
                      {
                        role: 'assistant',
                        kind: 'text',
                        text: `Added **${product.name}** to your cart — $${product.price.toFixed(2)}. ${cart.length === 0 ? 'You can keep shopping or say "checkout" when ready.' : 'Want to add anything else, or shall I take you to checkout?'}`,
                      },
                    ]);
                  }}
                />
              ))}
              {loading && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    alignSelf: 'flex-start',
                    background: 'rgba(25,70,200,0.06)',
                    border: `1px solid ${T.cyan}22`,
                    padding: '12px 16px',
                    borderRadius: '14px 14px 14px 4px',
                    display: 'flex', alignItems: 'center', gap: 10,
                    maxWidth: '85%',
                  }}>
                  <Loader2 size={14} className="pulse-soft" color={T.cyan} />
                  <span style={{ fontSize: 12, color: T.text2 }}>Searching catalog</span>
                  <div style={{ display: 'flex', gap: 3 }}>
                    <span className="think-dot" style={{ width: 4, height: 4, background: T.cyan, borderRadius: '50%' }} />
                    <span className="think-dot" style={{ width: 4, height: 4, background: T.cyan, borderRadius: '50%' }} />
                    <span className="think-dot" style={{ width: 4, height: 4, background: T.cyan, borderRadius: '50%' }} />
                  </div>
                </motion.div>
              )}

              {/* Quick-start suggestions (only when chat is fresh) */}
              {messages.length === 1 && !loading && (
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} style={{ marginTop: 6 }}>
                  <div className="mono" style={{ color: T.text3, marginBottom: 10, fontSize: 9 }}>
                    {(shopifyOrders?.length || 0) > 0 ? 'Personalized Recommendations for You' : 'Try asking'}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {chips.map(s => (
                      <button
                        key={s.label}
                        onClick={() => sendMessage(s.label)}
                        style={{
                          background: 'rgba(15,23,42,0.04)',
                          border: `1px solid ${T.hairline}`,
                          color: T.text,
                          padding: '12px 14px',
                          borderRadius: 8,
                          fontSize: 13,
                          textAlign: 'left',
                          cursor: 'pointer',
                          display: 'flex', alignItems: 'center', gap: 10,
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(25,70,200,0.08)'; e.currentTarget.style.borderColor = `${T.cyan}44`; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(15,23,42,0.04)'; e.currentTarget.style.borderColor = T.hairline; }}
                      >
                        <span style={{ color: T.cyan }}>{s.icon}</span>
                        {s.label}
                        <ArrowRight size={11} style={{ marginLeft: 'auto', opacity: 0.5 }} />
                      </button>
                    ))}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 12 }}>
                    <button onClick={() => setVisualOpen(true)} style={{
                      background: 'rgba(212,161,78,0.08)',
                      border: `1px solid ${T.amber}33`,
                      color: T.amber,
                      padding: '12px',
                      borderRadius: 8,
                      fontSize: 12, fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                    }}>
                      <Camera size={16} />
                      Visual Search
                    </button>
                    <button onClick={handleKitShortcut} style={{
                      background: 'rgba(22,163,74,0.08)',
                      border: `1px solid ${T.green}33`,
                      color: T.green,
                      padding: '12px',
                      borderRadius: 8,
                      fontSize: 12, fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                    }}>
                      <Sparkles size={16} />
                      Plan with AI
                    </button>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Input */}
            <form onSubmit={e => { e.preventDefault(); sendMessage(input); }} style={{
              padding: '14px 16px 16px',
              borderTop: `1px solid ${T.hairline}`,
              background: 'rgba(15,23,42,0.035)',
            }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: T.ink, border: `1px solid ${T.hairlineStrong}`,
                borderRadius: 999, padding: '4px 6px 4px 16px',
              }}>
                <input
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Ask anything…"
                  style={{
                    flex: 1,
                    background: 'transparent',
                    border: 0, outline: 'none',
                    color: T.text, fontSize: 13,
                    padding: '10px 0',
                  }}
                />
                <VoiceMicButton
                  value={input}
                  setValue={setInput}
                  disabled={loading}
                  title="Click to speak to the AI agent"
                  onAutoSubmit={(text) => {
                    // sendMessage guards against concurrent calls and clears
                    // the input itself, so we just pass the transcript through.
                    if (text?.trim()) sendMessage(text);
                  }}
                />
                <button type="button" onClick={() => setVisualOpen(true)} style={{
                  background: 'rgba(15,23,42,0.06)',
                  border: 0, color: T.text2,
                  width: 32, height: 32, borderRadius: '50%',
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
                title="Visual search"
                >
                  <Camera size={14} />
                </button>
                <button type="submit" disabled={!input.trim() || loading} style={{
                  background: (input.trim() && !loading) ? T.gradHero : 'rgba(15,23,42,0.06)',
                  border: 0,
                  color: (input.trim() && !loading) ? 'white' : T.text3,
                  width: 34, height: 34, borderRadius: '50%',
                  cursor: (input.trim() && !loading) ? 'pointer' : 'not-allowed',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: (input.trim() && !loading) ? `0 4px 16px ${T.violet}55, inset 0 1px 0 rgba(255,255,255,0.25)` : 'none',
                  transition: 'all 0.2s',
                }}>
                  {loading ? <Loader2 size={14} className="pulse-soft" /> : <ArrowRight size={14} strokeWidth={2.5} />}
                </button>
              </div>
            </form>

            <AnimatePresence>
              {visualOpen && <VisualSearchPanel onClose={() => setVisualOpen(false)} onResults={handleVisualResults} />}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

const ChatMessage = ({ msg, onProductClick, onAddToCart }) => {
  const isUser = msg.role === 'user';

  if (msg.kind === 'image-uploaded') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        style={{
          alignSelf: 'flex-end',
          background: 'rgba(212,161,78,0.1)',
          border: `1px solid ${T.amber}44`,
          padding: 8,
          borderRadius: '14px 14px 4px 14px',
          maxWidth: '70%',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
        {msg.preview && (
          <img
            src={msg.preview}
            alt="uploaded"
            style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 6, flexShrink: 0 }}
          />
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: T.text, paddingRight: 4 }}>
          <Camera size={12} color={T.amber} />
          <span>{msg.label}</span>
        </div>
      </motion.div>
    );
  }

  if (isUser) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        style={{
          alignSelf: 'flex-end',
          background: T.gradHero,
          color: 'white',
          padding: '10px 14px',
          borderRadius: '14px 14px 4px 14px',
          maxWidth: '85%',
          fontSize: 13, fontWeight: 500,
          boxShadow: `0 4px 16px ${T.violet}44, inset 0 1px 0 rgba(255,255,255,0.2)`,
        }}>
        {msg.text}
      </motion.div>
    );
  }

  // Assistant
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={{ alignSelf: 'flex-start', maxWidth: '92%' }}>
      <div style={{
        background: 'rgba(15,23,42,0.05)',
        border: `1px solid ${T.hairline}`,
        padding: '12px 14px',
        borderRadius: '14px 14px 14px 4px',
        fontSize: 13, lineHeight: 1.5, color: T.text,
      }}>
        {msg.text}
      </div>
      {msg.results && msg.results.length > 0 && (
        <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {msg.results.map((r, i) => (
            <motion.div
              key={r.product.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              style={{
                background: T.ink2,
                border: `1px solid ${T.hairline}`,
                padding: 10, borderRadius: 10,
                transition: 'all 0.2s',
              }}
            >
              <button
                onClick={() => onProductClick(r.product.id)}
                style={{
                  display: 'flex', gap: 12, alignItems: 'flex-start',
                  width: '100%',
                  background: 'transparent', border: 0,
                  padding: 0, cursor: 'pointer',
                  textAlign: 'left', color: 'inherit',
                  marginBottom: 8,
                }}
              >
                <div style={{ width: 56, height: 56, flexShrink: 0, borderRadius: 6, overflow: 'hidden' }}>
                  <ProductIllustration product={r.product} size="thumb" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="mono" style={{ color: T.amber, fontSize: 9, marginBottom: 2 }}>{r.product.brand}</div>
                  <div style={{ fontWeight: 600, fontSize: 12, marginBottom: 4, color: T.text, lineHeight: 1.3 }}>{r.product.name}</div>
                  <div style={{ fontSize: 11, color: T.text2, lineHeight: 1.4, marginBottom: 4 }}>
                    <Sparkles size={9} style={{ display: 'inline', verticalAlign: 'middle', color: T.cyan, marginRight: 4 }} />
                    {r.reason}
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: T.text }}>${r.product.price.toFixed(2)}</div>
                </div>
              </button>
              <div style={{ display: 'flex', gap: 6, borderTop: `1px solid ${T.hairline}`, paddingTop: 8 }}>
                <button
                  onClick={() => onProductClick(r.product.id)}
                  style={{
                    flex: 1,
                    background: T.glassSurface,
                    border: `1px solid ${T.glassBorder}`,
                    color: T.text2,
                    padding: '6px 10px',
                    borderRadius: 6,
                    fontSize: 11, fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = T.cyan + '66'; e.currentTarget.style.color = T.cyan; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = T.glassBorder; e.currentTarget.style.color = T.text2; }}
                >
                  View
                </button>
                <button
                  onClick={() => onAddToCart && onAddToCart(r.product)}
                  style={{
                    flex: 2,
                    background: T.gradAI,
                    border: 0,
                    color: 'white',
                    padding: '6px 10px',
                    borderRadius: 6,
                    fontSize: 11, fontWeight: 700, letterSpacing: 0.3,
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                    boxShadow: `0 2px 8px ${T.violet}44, inset 0 1px 0 rgba(255,255,255,0.2)`,
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = `0 4px 12px ${T.violet}66, inset 0 1px 0 rgba(255,255,255,0.25)`; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 2px 8px ${T.violet}44, inset 0 1px 0 rgba(255,255,255,0.2)`; }}
                >
                  <ShoppingCart size={11} strokeWidth={2.5} /> Add to cart
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

/* ============================================================================
   VISUAL SEARCH PANEL (used inside Chat Widget)
   ============================================================================ */
const VisualSearchPanel = ({ onClose, onResults }) => {
  const { llmEnabled } = useApp();
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [identified, setIdentified] = useState(null);
  const [error, setError] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  // ---- Camera capture state ----
  // We support live webcam (laptop) or back camera (mobile) via getUserMedia.
  // On mobile, also fall back to a hidden file input with capture="environment"
  // for devices that block getUserMedia (rare but possible).
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [capturedDataUrl, setCapturedDataUrl] = useState(null);   // shows freeze frame before "Use this"
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // Open the camera. Try rear-facing first (good for mobile + product photography),
  // fall back to any camera if rear unavailable (laptops).
  const startCamera = async () => {
    setCameraError(null);
    setCapturedDataUrl(null);
    setCameraOpen(true);
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError('Camera not supported in this browser. Try uploading instead.');
      return;
    }
    try {
      // Prefer back-facing camera; falls back to default if exact unavailable
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
      } catch {
        // If that fails, try any camera
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      }
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraReady(true);
      }
    } catch (err) {
      console.error('Camera error:', err);
      if (err.name === 'NotAllowedError') {
        setCameraError('Camera permission denied. Allow camera access in your browser settings and try again.');
      } else if (err.name === 'NotFoundError') {
        setCameraError('No camera detected on this device. Try uploading an image instead.');
      } else {
        setCameraError('Could not start the camera. Try uploading an image instead.');
      }
    }
  };

  // Release camera tracks so the indicator light goes off and the OS knows we're done.
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraReady(false);
    setCameraOpen(false);
    setCapturedDataUrl(null);
    setCameraError(null);
  };

  // Snap a frame from the live video into a canvas, then convert to a Blob/File
  // and run it through the same processing pipeline as uploaded images.
  const captureFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    // Match canvas to actual video dimensions for best quality
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedDataUrl(dataUrl);
  };

  // User clicked "Use this photo" — convert the frozen frame to a File and run it.
  const useCapturedPhoto = async () => {
    if (!capturedDataUrl) return;
    try {
      const resp = await fetch(capturedDataUrl);
      const blob = await resp.blob();
      const file = new File([blob], 'webcam-capture.jpg', { type: 'image/jpeg' });
      stopCamera();
      processFile(file);
    } catch (err) {
      console.error('Capture conversion failed:', err);
      setError('Could not process captured photo. Please try again.');
    }
  };

  // Always release the camera when the panel unmounts (closes).
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  // Helper: convert a File to base64 (without data: prefix) and media type
  const fileToBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      const [meta, b64] = dataUrl.split(',');
      const mediaType = meta.match(/data:(.+?);base64/)?.[1] || 'image/jpeg';
      resolve({ base64: b64, mediaType, dataUrl });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const processFile = async (file) => {
    // === VISION DEBUG: log every checkpoint so we can diagnose silent failures ===
    console.log('🔍 VISION_DEBUG [step 1/6] File received:', {
      name: file?.name,
      type: file?.type,
      size: file?.size,
      sizeKB: file ? (file.size / 1024).toFixed(1) + ' KB' : 'n/a',
    });

    if (!file || !file.type.startsWith('image/')) {
      console.warn('🔍 VISION_DEBUG: rejected — not an image file');
      setError('Please upload an image file.');
      return;
    }
    // 5MB cap to avoid huge base64 payloads
    if (file.size > 5 * 1024 * 1024) {
      console.warn('🔍 VISION_DEBUG: rejected — over 5MB');
      setError('Image too large. Please use one under 5MB.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      // Compress the image before sending — webcam captures and phone photos
      // can be 2-4MB even after JPEG encoding. We resize to 1024px max edge
      // and re-encode at 0.85 quality, which keeps Claude vision quality
      // while staying well under any payload limits.
      const compressed = await compressImage(file);
      console.log('🔍 VISION_DEBUG [step 2/6] Compressed:', {
        originalSize: (file.size / 1024).toFixed(1) + ' KB',
        compressedSize: (compressed.size / 1024).toFixed(1) + ' KB',
        compressedType: compressed.type,
      });

      const { base64, mediaType, dataUrl } = await fileToBase64(compressed);
      console.log('🔍 VISION_DEBUG [step 3/6] Base64 encoded:', {
        mediaType,
        base64Length: base64.length,
        base64SizeKB: (base64.length / 1024).toFixed(1) + ' KB',
        first50Chars: base64.slice(0, 50),
      });
      setPreviewUrl(dataUrl);

      let products = [];
      let identifiedText = null;
      let usedFallback = false;
      let fallbackReason = null;

      if (llmEnabled) {
        console.log('🔍 VISION_DEBUG [step 4/6] Calling Claude vision...', {
          llmEnabled,
          configSource: LLM_CONFIG.source,
          proxyUrl: LLM_CONFIG.proxyUrl || '(direct mode)',
          model: LLM_CONFIG.model,
        });

        // Real Claude vision call
        const llmResult = await callLLMForImage(base64, mediaType);

        console.log('🔍 VISION_DEBUG [step 5/6] Vision result:', llmResult);

        if (llmResult && !llmResult.error && llmResult.results?.length > 0) {
          // Success — read identified directly from result (not async state)
          identifiedText = llmResult.identified;
          const productMap = await Promise.all(
            llmResult.results.map(r => adapter.getProduct(r.id).then(p => ({ product: p, reason: r.reason })))
          );
          products = productMap.filter(x => x.product);
          console.log('🔍 VISION_DEBUG [step 6/6] SUCCESS:', {
            identified: identifiedText,
            productsFound: products.length,
            productNames: products.map(x => x.product.name),
          });
        } else {
          // LLM call failed or returned no usable results — note the reason
          usedFallback = true;
          fallbackReason = llmResult?.error || 'no_results';
          console.warn('🔍 VISION_DEBUG [step 6/6] FALLBACK USED. Reason:', fallbackReason, 'Full result:', llmResult);
        }
      } else {
        usedFallback = true;
        fallbackReason = 'disabled';
        console.warn('🔍 VISION_DEBUG: LLM is disabled — using fallback');
      }

      // Fallback path: pick closest catalog matches by category, with honest message
      if (products.length === 0) {
        const fallbackResults = await adapter.visualSearch({ type: 'default' });
        products = fallbackResults.map(p => ({ product: p, reason: 'Best-guess catalog pick' }));
        if (fallbackReason === 'disabled') {
          identifiedText = 'AI vision is off — showing top picks. Connect the AI agent for real image matching.';
        } else {
          identifiedText = "I couldn't analyze this image clearly — here are some popular catalog picks instead.";
        }
      }

      setLoading(false);
      onResults({
        identified: identifiedText || 'Image analyzed',
        products,
        previewUrl: dataUrl,
        usedFallback,
      });
    } catch (err) {
      console.error('Visual search error:', err);
      setError('Something went wrong analyzing the image.');
      setLoading(false);
    }
  };

  // Resize and re-encode the image to keep payloads small and within Claude vision limits.
  // Max edge 1024px, JPEG quality 0.85. Returns a File.
  const compressImage = (file) => new Promise((resolve, reject) => {
    const img = new Image();
    const fileUrl = URL.createObjectURL(file);
    img.onload = () => {
      const maxEdge = 1024;
      let { width, height } = img;
      if (width > maxEdge || height > maxEdge) {
        if (width > height) {
          height = Math.round((height * maxEdge) / width);
          width = maxEdge;
        } else {
          width = Math.round((width * maxEdge) / height);
          height = maxEdge;
        }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(fileUrl);
          if (!blob) return reject(new Error('Compression failed'));
          resolve(new File([blob], file.name || 'image.jpg', { type: 'image/jpeg' }));
        },
        'image/jpeg',
        0.85
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(fileUrl);
      reject(new Error('Could not load image for compression'));
    };
    img.src = fileUrl;
  });

  // Pull a sample image from Unsplash and feed it through the same pipeline
  const useSample = async (url, label) => {
    setError(null);
    setLoading(true);
    setPreviewUrl(url);
    try {
      const resp = await fetch(url);
      const blob = await resp.blob();
      const file = new File([blob], `${label}.jpg`, { type: blob.type || 'image/jpeg' });
      processFile(file);
    } catch (err) {
      console.error('Sample fetch failed:', err);
      setError('Could not load sample image. Try uploading your own.');
      setLoading(false);
    }
  };

  const onFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={() => { stopCamera(); onClose(); }}
      style={{
        position: 'absolute', inset: 0, zIndex: 5,
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(12px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
      }}>
      <motion.div
        initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }}
        onClick={e => e.stopPropagation()}
        style={{
          background: T.ink2,
          border: `1px solid ${T.hairlineStrong}`,
          borderRadius: 12,
          padding: 22,
          width: '100%',
          maxWidth: cameraOpen ? 520 : 380,
          maxHeight: 'calc(100vh - 80px)',
          overflowY: 'auto',
          transition: 'max-width 0.2s',
        }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <div>
            <div className="mono" style={{ color: T.amber, marginBottom: 4 }}>
              Visual Search {llmEnabled && <span style={{ color: T.violet, marginLeft: 6 }}>· AI Vision</span>}
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color: T.text }}>
              {cameraOpen ? 'Point your camera at a product' : 'Upload an image to find matches'}
            </div>
          </div>
          <button onClick={() => { stopCamera(); onClose(); }} style={{ background: 'rgba(15,23,42,0.06)', border: 0, width: 28, height: 28, borderRadius: 6, color: T.text2, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={14} />
          </button>
        </div>

        {/* ---------- Camera live capture UI ---------- */}
        {cameraOpen && (
          <div>
            <div style={{
              position: 'relative',
              width: '100%',
              aspectRatio: '4 / 3',
              background: '#000',
              borderRadius: 8,
              overflow: 'hidden',
              border: `1px solid ${T.hairline}`,
              marginBottom: 14,
            }}>
              {/* Live video element (hidden when freeze frame shown) */}
              <video
                ref={videoRef}
                playsInline
                muted
                autoPlay
                style={{
                  width: '100%', height: '100%', objectFit: 'cover',
                  display: capturedDataUrl ? 'none' : 'block',
                }}
              />
              {/* Freeze frame preview */}
              {capturedDataUrl && (
                <img src={capturedDataUrl} alt="captured" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              )}
              {/* Loading state until video reports ready */}
              {!cameraReady && !cameraError && !capturedDataUrl && (
                <div style={{
                  position: 'absolute', inset: 0, display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  flexDirection: 'column', color: T.text2,
                }}>
                  <Loader2 size={20} className="pulse-soft" style={{ marginBottom: 8 }} />
                  <div style={{ fontSize: 11 }}>Starting camera…</div>
                </div>
              )}
              {/* Hidden canvas for frame extraction */}
              <canvas ref={canvasRef} style={{ display: 'none' }} />
            </div>

            {cameraError ? (
              <>
                <div style={{
                  padding: '10px 12px', marginBottom: 12, borderRadius: 6,
                  background: 'rgba(200,16,46,0.1)', border: `1px solid ${T.red}33`,
                  color: T.red, fontSize: 12,
                }}>{cameraError}</div>
                <button onClick={stopCamera} style={{
                  width: '100%', padding: '10px 16px',
                  background: 'rgba(15,23,42,0.06)', color: T.text,
                  border: `1px solid ${T.hairline}`, borderRadius: 6,
                  fontSize: 12, fontWeight: 600, cursor: 'pointer',
                }}>Close camera</button>
              </>
            ) : capturedDataUrl ? (
              // Post-capture: choose Retake or Use this
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <button onClick={() => setCapturedDataUrl(null)} style={{
                  padding: '12px 16px',
                  background: 'rgba(15,23,42,0.06)', color: T.text,
                  border: `1px solid ${T.hairline}`, borderRadius: 6,
                  fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}>↻ Retake</button>
                <button onClick={useCapturedPhoto} style={{
                  padding: '12px 16px',
                  background: T.gradHero, color: 'white',
                  border: 0, borderRadius: 6,
                  fontSize: 12, fontWeight: 700, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  boxShadow: `0 4px 16px ${T.violet}33`,
                }}>
                  <Check size={14} /> Use this photo
                </button>
              </div>
            ) : (
              // Live preview: Capture button
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 10 }}>
                <button onClick={stopCamera} style={{
                  padding: '12px 16px',
                  background: 'rgba(15,23,42,0.06)', color: T.text2,
                  border: `1px solid ${T.hairline}`, borderRadius: 6,
                  fontSize: 12, fontWeight: 600, cursor: 'pointer',
                }}>Cancel</button>
                <button onClick={captureFrame} disabled={!cameraReady} style={{
                  padding: '12px 16px',
                  background: cameraReady ? T.gradHero : 'rgba(15,23,42,0.06)',
                  color: 'white',
                  border: 0, borderRadius: 6,
                  fontSize: 12, fontWeight: 700,
                  cursor: cameraReady ? 'pointer' : 'not-allowed',
                  opacity: cameraReady ? 1 : 0.5,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  boxShadow: cameraReady ? `0 4px 16px ${T.violet}33` : 'none',
                }}>
                  <Camera size={14} /> Capture
                </button>
              </div>
            )}
          </div>
        )}

        {/* ---------- Loading state (analyzing image) ---------- */}
        {!cameraOpen && loading ? (
          <div style={{ textAlign: 'center', padding: 30 }}>
            {previewUrl && (
              <div style={{ width: 120, height: 120, margin: '0 auto 16px', borderRadius: 8, overflow: 'hidden', border: `1px solid ${T.hairline}` }}>
                <img src={previewUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}
            <Loader2 size={24} className="pulse-soft" color={T.violet} style={{ marginBottom: 10 }} />
            <div style={{ fontWeight: 600, fontSize: 13, color: T.text }}>
              {llmEnabled ? 'AI is analyzing your image…' : 'Searching catalog…'}
            </div>
            <div style={{ fontSize: 11, color: T.text3, marginTop: 4 }}>
              {llmEnabled ? 'Identifying the product and matching it' : 'Matching against 50,000+ SKUs'}
            </div>
          </div>
        ) : !cameraOpen && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={onFileChange}
              style={{ display: 'none' }}
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              style={{
                border: `1px dashed ${dragOver ? T.violet : T.hairlineStrong}`,
                background: dragOver ? `${T.violet}11` : 'transparent',
                padding: 22,
                textAlign: 'center',
                borderRadius: 8,
                marginBottom: 10,
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}>
              <Upload size={22} color={dragOver ? T.violet : T.text3} style={{ marginBottom: 6 }} />
              <div style={{ fontSize: 12, color: T.text2, marginBottom: 2 }}>
                <strong style={{ color: T.text }}>Click to upload</strong> or drag an image
              </div>
              <div style={{ fontSize: 10, color: T.text3 }}>JPG, PNG, WebP · up to 5MB</div>
            </div>

            {/* Take Photo button — opens live camera (laptop webcam or mobile rear cam) */}
            <button onClick={startCamera} style={{
              width: '100%',
              padding: '12px 16px',
              marginBottom: 14,
              background: 'rgba(149, 95, 255, 0.08)',
              color: T.text,
              border: `1px solid ${T.violet}55`,
              borderRadius: 8,
              fontSize: 12, fontWeight: 600,
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(149, 95, 255, 0.15)';
              e.currentTarget.style.borderColor = `${T.violet}99`;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(149, 95, 255, 0.08)';
              e.currentTarget.style.borderColor = `${T.violet}55`;
            }}>
              <Camera size={14} color={T.violet} />
              Take photo with camera
            </button>

            {error && (
              <div style={{
                padding: '8px 12px', marginBottom: 12, borderRadius: 6,
                background: 'rgba(200,16,46,0.1)', border: `1px solid ${T.red}33`,
                color: T.red, fontSize: 12,
              }}>{error}</div>
            )}
            <div className="mono" style={{ color: T.text3, fontSize: 9, marginBottom: 8 }}>Or try a sample</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {/* Sample images are self-hosted SVGs bundled in the repo (public/samples/).
                  This eliminates dependency on any external CDN (Unsplash, etc.) — the
                  samples will load on ANY network the site itself loads on, including
                  corporate networks that block image CDNs. The `${BASE_URL}` prefix is
                  required because Vite serves under /asodemo/ on GitHub Pages.
                  AI Vision can analyze these placeholder graphics — it will recognize
                  them as themed product cards ("athletic shoe outline", "rifle scope",
                  etc.) and produce reasonable category-level search results. */}
              {[
                { file: 'runner.svg', label: 'Runner' },
                { file: 'jersey.svg', label: 'Jersey' },
                { file: 'scope.svg',  label: 'Scope' },
                { file: 'lure.svg',   label: 'Lure' },
                { file: 'ball.svg',   label: 'Ball' },
                { file: 'cooler.svg', label: 'Cooler' },
              ].map(s => {
                const url = `${import.meta.env.BASE_URL}samples/${s.file}`;
                return (
                  <button key={s.label} onClick={() => useSample(url, s.label)} style={{
                    background: T.ink3,
                    border: `1px solid ${T.hairline}`,
                    padding: 6,
                    cursor: 'pointer',
                    borderRadius: 6,
                    textAlign: 'center',
                    color: T.text,
                    overflow: 'hidden',
                  }}>
                    <div style={{ width: '100%', aspectRatio: '1', borderRadius: 4, overflow: 'hidden', marginBottom: 4, background: T.void }}>
                      <img
                        src={url}
                        alt={s.label}
                        loading="lazy"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => {
                          // SVG samples should never fail since they're bundled,
                          // but if they do (very old browser without SVG support, etc),
                          // show a clean camera icon rather than a broken-image symbol.
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.parentElement.style.background = T.violet + '22';
                          e.currentTarget.parentElement.style.display = 'flex';
                          e.currentTarget.parentElement.style.alignItems = 'center';
                          e.currentTarget.parentElement.style.justifyContent = 'center';
                          e.currentTarget.parentElement.innerHTML = `<div style="font-size: 24px; color: ${T.violet}">📷</div>`;
                        }}
                      />
                    </div>
                    <div style={{ fontSize: 10, fontWeight: 600 }}>{s.label}</div>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
};

/* ============================================================================
   KIT BUILDER
   ============================================================================ */
const KIT_SCRIPTS = {
  'deer hunt': {
    thoughts: [
      'Analyzing budget: $800 for two people, weekend timeframe…',
      'Pre-deer-season in Texas → blinds, calls, and concealment are top priority.',
      'Two hunters means doubling consumables but sharing shelter.',
      'Premium scope unaffordable at this budget — prioritizing field-ready basics.',
      'Cross-referencing inventory for availability and bundle compatibility…',
    ],
    items: [
      { id: 'h002', qty: 1, reason: 'Two-person ground blind — fits both hunters comfortably.', cat: 'Concealment' },
      { id: 'h005', qty: 2, reason: 'Insulated camo for early-season Texas temps. One per hunter.', cat: 'Apparel' },
      { id: 'h006', qty: 1, reason: 'Deer call bundle — shareable between the pair.', cat: 'Calling' },
      { id: 'h007', qty: 2, reason: 'Waterproof boots — essential for both hunters.', cat: 'Footwear' },
    ],
  },
  'soccer player': {
    thoughts: [
      'First-year soccer, age 10 → youth sizing across the board.',
      'Firm-ground cleats are the safer default for school fields…',
      'Shin guards required by league play.',
      'Building a complete starter kit — cleats, ball, protection, transport.',
      'Total estimated: under $180 for full first-season setup.',
    ],
    items: [
      { id: 't001', qty: 1, reason: 'Youth firm-ground cleats — sized for a 10-year-old.', cat: 'Footwear' },
      { id: 't002', qty: 1, reason: 'Size 4 match ball — correct size for U-11.', cat: 'Equipment' },
      { id: 't003', qty: 1, reason: 'Youth shin guards — required by most leagues.', cat: 'Safety' },
      { id: 't004', qty: 1, reason: '3-pack socks — covers practice and game days.', cat: 'Apparel' },
      { id: 't006', qty: 1, reason: 'Youth duffel — fits all gear for the season.', cat: 'Bag' },
    ],
  },
  'beach camping': {
    thoughts: [
      'Family of four, three nights — sizing tent and sleep system accordingly…',
      '6-person tent gives buffer for gear inside.',
      'Beach environment means insulated cooler is critical.',
      'Two-burner stove handles family meals.',
      'Building list weighted toward comfort and shared use.',
    ],
    items: [
      { id: 'c001', qty: 1, reason: '6-person tent — gives family of four room plus gear storage.', cat: 'Shelter' },
      { id: 'c002', qty: 4, reason: 'Sleeping bags rated for cool coastal nights — one per person.', cat: 'Sleep' },
      { id: 'c003', qty: 1, reason: 'Chair 4-pack — exactly fits the family.', cat: 'Furniture' },
      { id: 'c004', qty: 1, reason: 'Premium cooler — handles 3 days of food in beach heat.', cat: 'Cooling' },
      { id: 'c005', qty: 1, reason: '2-burner stove — handles family-sized meals.', cat: 'Cooking' },
    ],
  },
};

/* ============================================================================
   ORDERS PAGE — real Shopify order history for the active persona.
   Reads shopifyOrders from context (populated by the live Storefront session).
   Only reachable when the Shopify adapter is live and the persona has orders.
   ============================================================================ */
const OrdersPage = () => {
  const { shopifyOrders, shopifyLoading, shopifySession, persona, setView, setActiveProduct } = useApp();
  const personaName = PERSONAS[persona]?.name || 'Your';
  const profile = shopifySession?.profile;

  // Disruption email state: { [orderNumber]: { status: 'sending'|'sent'|'error', scenario, msg } }
  const [disruption, setDisruption] = useState({});
  // Per-order configurable delay (days). >3 triggers the alternate-recovery path.
  const [delayDaysByOrder, setDelayDaysByOrder] = useState({});
  const delayDaysFor = (orderNumber) => delayDaysByOrder[orderNumber] ?? 3;

  const customerZip = shopifySession?.profile?.address?.zip || '77024';
  const homeStore = zipToStore(customerZip);
  const recipientEmail = shopifySession?.profile?.email || PERSONAS[persona]?.shopify?.email;

  // Trigger a disruption (delay or cancel) for one order → AI-draft + real send.
  // For 'delay': delayDays is configurable; if >3 days, we also surface an
  // in-stock alternate and embed an "Accept the alternate" CTA in the email
  // that swaps the order via the worker on click.
  const triggerDisruption = async (order, scenario, delayDays) => {
    if (!recipientEmail) {
      setDisruption(d => ({ ...d, [order.orderNumber]: { status: 'error', scenario, msg: 'No customer email on file.' } }));
      return;
    }
    setDisruption(d => ({ ...d, [order.orderNumber]: { status: 'sending', scenario } }));

    const focusItem = order.items?.[0] || null;
    const effectiveDelay = scenario === 'delay' ? (delayDays || 3) : null;
    // Alternate is offered when: cancel (always), OR delay > 3 days.
    const needAlternate = scenario === 'cancel' || (scenario === 'delay' && effectiveDelay > 3);
    const alternate = needAlternate ? pickAlternate(focusItem, CATALOG) : null;
    const eta = scenario === 'delay' ? reEvaluatedEta(effectiveDelay) : null;

    // BOPIS option — only worth checking when the email might mention store pickup:
    // - cancel: always (online out-of-stock but maybe on a store shelf)
    // - delay <= 3 days: yes (alternate path supersedes BOPIS for >3 days delays)
    let inStoreOption = null;
    const considerInStore = scenario === 'cancel' || (scenario === 'delay' && effectiveDelay <= 3);
    if (considerInStore && focusItem?.handle && typeof adapter.getInventoryByLocation === 'function') {
      try {
        const inv = await adapter.getInventoryByLocation(focusItem.handle);
        inStoreOption = findInStoreStock(inv, homeStore);
      } catch { /* omit BOPIS on error */ }
    }

    // Build the swap-accept URL only for delay-with-alternate (cancel doesn't need it
    // — cancel emails describe the swap as already happening, no user click required).
    const acceptSwapUrl = (scenario === 'delay' && alternate && order.id && alternate.shopifyVariantId)
      ? swapAcceptUrl({
          key: recipientEmail,
          orderGid: order.id,
          variantGid: alternate.shopifyVariantId,
          qty: focusItem?.quantity || 1,
          title: alternate.name,
          price: alternate.price?.toFixed(2),
          origName: `#${order.orderNumber}`,
        })
      : null;

    const email = await draftPersonalizedEmail({
      scenario,
      persona,
      customer: profile,
      orders: shopifyOrders,
      focusItem,
      alternate,
      eta,
      homeStore,
      delayDays: effectiveDelay,
      acceptSwapUrl,
      inStoreOption,
    });

    const sendRes = await sendEmail({
      to: recipientEmail,
      subject: email.subject,
      html: email.html,
      text: email.text,
    });

    const successMsg = scenario === 'delay'
      ? (acceptSwapUrl
          ? `Delay email sent (${effectiveDelay}d) — alternate offered: ${alternate?.name}`
          : inStoreOption
            ? `Delay email sent (${effectiveDelay}d) — pickup offered at ${inStoreOption.store.name}`
            : `Delay email sent — new ETA ${eta}`)
      : (inStoreOption
          ? `Cancel email sent — pickup at ${inStoreOption.store.name} + alternate ${alternate?.name}`
          : `Cancel email sent — offered ${alternate?.name || 'an alternate'}`);

    setDisruption(d => ({
      ...d,
      [order.orderNumber]: sendRes.success
        ? { status: 'sent', scenario, msg: successMsg, to: recipientEmail }
        : { status: 'error', scenario, msg: sendRes.error || 'Send failed' },
    }));
  };

  const fmtDate = (d) => {
    try {
      return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch { return ''; }
  };
  const relativeLabel = (daysAgo) => {
    if (daysAgo == null) return '';
    if (daysAgo === 0) return 'Today';
    if (daysAgo === 1) return 'Yesterday';
    if (daysAgo < 30) return `${daysAgo} days ago`;
    if (daysAgo < 60) return 'Last month';
    const months = Math.round(daysAgo / 30);
    return `${months} months ago`;
  };

  const orders = shopifyOrders || [];
  const lifetimeTotal = orders.reduce((s, o) => s + (o.total || 0), 0);
  const itemCount = orders.reduce((s, o) => s + o.items.reduce((n, i) => n + (i.quantity || 1), 0), 0);

  const openProduct = (handle) => {
    if (!handle) return;
    setActiveProduct(handle);
    setView('pdp');
  };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 32px 96px' }}>
      {/* Header */}
      <div style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{
          fontFamily: T.mono, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase',
          color: T.cyan, background: 'rgba(37,99,235,0.08)', border: `1px solid ${T.cyan}33`,
          padding: '4px 10px', borderRadius: 999,
        }}>
          ● Live Shopify data
        </span>
      </div>
      <h1 className="display" style={{ fontSize: 40, margin: '0 0 8px', color: T.text, fontWeight: 600 }}>
        {personaName}'s Orders
      </h1>
      <p style={{ color: T.text2, fontSize: 15, margin: '0 0 32px', maxWidth: 560 }}>
        {profile?.email
          ? <>Pulled live from Shopify for <span style={{ color: T.text, fontFamily: T.mono, fontSize: 13 }}>{profile.email}</span>.</>
          : <>Your order history, pulled live from the Shopify Storefront API.</>}
      </p>

      {/* Summary stats */}
      {orders.length > 0 && (
        <div style={{ display: 'flex', gap: 16, marginBottom: 36, flexWrap: 'wrap' }}>
          {[
            ['Orders', orders.length],
            ['Items purchased', itemCount],
            ['Lifetime spend', `$${lifetimeTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
          ].map(([label, val]) => (
            <div key={label} style={{
              flex: '1 1 160px', background: T.glassSurface, border: `1px solid ${T.hairline}`,
              borderRadius: 16, padding: '20px 24px',
            }}>
              <div style={{ fontFamily: T.mono, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.text3, marginBottom: 8 }}>{label}</div>
              <div className="display" style={{ fontSize: 28, color: T.text, fontWeight: 600 }}>{val}</div>
            </div>
          ))}
        </div>
      )}

      {/* Loading */}
      {shopifyLoading && orders.length === 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: T.text2, padding: '48px 0' }}>
          <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
          Loading your orders from Shopify…
        </div>
      )}

      {/* Empty */}
      {!shopifyLoading && orders.length === 0 && (
        <div style={{
          background: T.glassSurface, border: `1px solid ${T.hairline}`, borderRadius: 16,
          padding: '48px 32px', textAlign: 'center', color: T.text2,
        }}>
          No orders found for this account yet.
        </div>
      )}

      {/* Order list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {orders.map((order) => (
          <div key={order.orderNumber} style={{
            background: T.glassSurface, border: `1px solid ${T.hairline}`,
            borderRadius: 18, overflow: 'hidden',
          }}>
            {/* Order header row */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '18px 24px', borderBottom: `1px solid ${T.hairline}`,
              background: 'rgba(15,23,42,0.035)', flexWrap: 'wrap', gap: 12,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontFamily: T.mono, fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: T.text3 }}>Order</div>
                  <div style={{ color: T.text, fontWeight: 600, fontSize: 15 }}>#{order.orderNumber}</div>
                </div>
                <div>
                  <div style={{ fontFamily: T.mono, fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: T.text3 }}>Placed</div>
                  <div style={{ color: T.text2, fontSize: 14 }}>
                    {fmtDate(order.date)}
                    {order.daysAgo != null && <span style={{ color: T.text3, marginLeft: 8 }}>· {relativeLabel(order.daysAgo)}</span>}
                  </div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: T.mono, fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: T.text3 }}>Total</div>
                <div className="display" style={{ color: T.amber, fontWeight: 600, fontSize: 20 }}>
                  ${order.total.toFixed(2)}
                </div>
              </div>
            </div>

            {/* Line items */}
            <div style={{ padding: '8px 12px' }}>
              {order.items.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => openProduct(item.handle)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 16, width: '100%',
                    background: 'transparent', border: 0, borderRadius: 12,
                    padding: '12px', cursor: item.handle ? 'pointer' : 'default',
                    textAlign: 'left', transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => { if (item.handle) e.currentTarget.style.background = 'rgba(15,23,42,0.05)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                >
                  {/* Thumbnail */}
                  <div style={{
                    width: 56, height: 56, borderRadius: 10, flexShrink: 0,
                    background: T.ink2, border: `1px solid ${T.hairline}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    overflow: 'hidden',
                  }}>
                    {item.photo
                      ? <img src={item.photo} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.currentTarget.style.display = 'none'; }} />
                      : <span style={{ fontSize: 24 }}>📦</span>}
                  </div>
                  {/* Title + qty */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: T.text, fontSize: 14, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.title}
                    </div>
                    <div style={{ color: T.text3, fontSize: 12, marginTop: 2 }}>
                      Qty {item.quantity}{item.price > 0 && <> · ${item.price.toFixed(2)} ea</>}
                    </div>
                  </div>
                  {item.handle && <ChevronRight size={16} style={{ color: T.text3, flexShrink: 0 }} />}
                </button>
              ))}
            </div>

            {/* Disruption controls — agentic recovery email (delay / cancel) */}
            <div style={{
              borderTop: `1px solid ${T.hairline}`, padding: '12px 16px',
              display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
            }}>
              {(() => {
                const d = disruption[order.orderNumber];
                if (d?.status === 'sending') {
                  return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: T.cyan, fontSize: 12, fontFamily: T.mono }}>
                    <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} />
                    AI drafting {d.scenario === 'delay' ? 'delay' : 'cancellation'} email…
                  </span>;
                }
                if (d?.status === 'sent') {
                  return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: T.lime, fontSize: 12, fontFamily: T.mono }}>
                    <Check size={13} strokeWidth={3} /> {d.msg} → {d.to}
                  </span>;
                }
                if (d?.status === 'error') {
                  return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: T.red, fontSize: 12, fontFamily: T.mono }}>
                    <X size={13} /> {d.msg}
                  </span>;
                }
                return <>
                  <span style={{ fontSize: 11, fontFamily: T.mono, color: T.text3, marginRight: 4 }}>Simulate disruption:</span>
                  <select
                    value={delayDaysFor(order.orderNumber)}
                    onChange={e => setDelayDaysByOrder(m => ({ ...m, [order.orderNumber]: Number(e.target.value) }))}
                    title="Days the order is delayed by — over 3 days triggers an alternate-product recovery"
                    style={{
                      background: 'rgba(234,88,12,0.08)', border: `1px solid ${T.amber}55`,
                      color: T.amber, fontSize: 12, fontWeight: 600, padding: '5px 8px',
                      borderRadius: 999, cursor: 'pointer', fontFamily: T.mono, outline: 'none', appearance: 'none',
                    }}>
                    <option value={1} style={{ background: '#14141c', color: T.amber }}>1d</option>
                    <option value={3} style={{ background: '#14141c', color: T.amber }}>3d</option>
                    <option value={5} style={{ background: '#14141c', color: T.amber }}>5d ↻</option>
                    <option value={7} style={{ background: '#14141c', color: T.amber }}>7d ↻</option>
                  </select>
                  <button
                    onClick={() => triggerDisruption(order, 'delay', delayDaysFor(order.orderNumber))}
                    title={delayDaysFor(order.orderNumber) > 3 ? 'Delay is over 3 days — email will include an alternate-product recovery option' : 'Send delay notification'}
                    style={{
                      background: 'rgba(234,88,12,0.08)', border: `1px solid ${T.amber}55`,
                      color: T.amber, fontSize: 12, fontWeight: 600, padding: '6px 12px',
                      borderRadius: 999, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6,
                    }}>
                    <Loader2 size={12} /> Delay {delayDaysFor(order.orderNumber) > 3 && '+ alt'}
                  </button>
                  <button
                    onClick={() => triggerDisruption(order, 'cancel')}
                    style={{
                      background: 'rgba(200,16,46,0.08)', border: `1px solid ${T.red}44`,
                      color: T.red, fontSize: 12, fontWeight: 600, padding: '6px 12px',
                      borderRadius: 999, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6,
                    }}>
                    <X size={12} /> Cancel
                  </button>
                </>;
              })()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ============================================================================
   KIT BUILDER — agentic kit assembly with live delivery promise.
   ============================================================================ */

// Map a customer ZIP to the nearest of our 4 stores. Coarse first-3-digit
// heuristic — good enough for the demo's Texas-centric ZIPs.
// Physical store metadata. address + hours are demo placeholders — swap for the
// real store records when you have them; the BOPIS email copy uses these verbatim.
const STORE_BY_ID = {
  shop:    { id: 'shop',    name: 'Online warehouse', city: 'Online',  zip: null,    address: null,                                hours: null },
  houston: { id: 'houston', name: 'Houston Memorial', city: 'Houston', zip: '77024', address: '20140 Eastex Fwy, Houston, TX 77024',  hours: 'Mon–Sat 9 AM – 9 PM · Sun 10 AM – 7 PM' },
  cypress: { id: 'cypress', name: 'Cypress',          city: 'Cypress', zip: '77433', address: '25803 Northwest Fwy, Cypress, TX 77433', hours: 'Mon–Sat 9 AM – 9 PM · Sun 10 AM – 7 PM' },
  plano:   { id: 'plano',   name: 'Plano',            city: 'Plano',   zip: '75024', address: '5900 W Park Blvd, Plano, TX 75093',       hours: 'Mon–Sat 9 AM – 9 PM · Sun 10 AM – 7 PM' },
};
function zipToStore(zip) {
  const z = String(zip || '').slice(0, 5);
  if (z.startsWith('750') || z.startsWith('751') || z.startsWith('752')) return STORE_BY_ID.plano;
  if (z.startsWith('774')) return STORE_BY_ID.cypress;
  if (z.startsWith('770') || z.startsWith('772') || z.startsWith('773')) return STORE_BY_ID.houston;
  return STORE_BY_ID.houston;   // default
}

// Turn a per-location inventory result into a human delivery promise relative
// to the customer's home store. Returns { label, tone } or null.
function deliveryPromise(inv, homeStore) {
  if (!inv || !inv.locations) return null;
  const atHome = inv.locations.find(l => l.id === homeStore.id);
  if (atHome && atHome.qty > 0) {
    return { label: `In stock at ${homeStore.city} · ships tomorrow`, tone: 'good', qty: atHome.qty };
  }
  // Not at home store — find any other store with stock
  const elsewhere = inv.locations.find(l => l.qty > 0 && l.id !== 'shop');
  if (elsewhere) {
    return { label: `In stock at ${elsewhere.city} · ships in 2 days`, tone: 'ok', qty: elsewhere.qty };
  }
  const online = inv.locations.find(l => l.id === 'shop' && l.qty > 0);
  if (online) {
    return { label: `Ships from warehouse · 3–5 days`, tone: 'ok', qty: online.qty };
  }
  return { label: 'Backordered', tone: 'bad', qty: 0 };
}

// Find the best physical store where this product is on the shelf right now.
// Used by the disruption emails to offer a BOPIS (pickup) option:
//   - Prefer the customer's home store
//   - Fall back to any other physical store (NOT the 'shop' online warehouse)
//   - Returns null if it's only available online / nowhere — caller omits BOPIS.
function findInStoreStock(inv, homeStore) {
  if (!inv || !inv.locations || !homeStore) return null;
  const atHome = inv.locations.find(l => l.id === homeStore.id && l.qty > 0);
  if (atHome) {
    const s = STORE_BY_ID[atHome.id];
    return s ? { store: s, qty: atHome.qty, isHome: true } : null;
  }
  const elsewhere = inv.locations.find(l => l.qty > 0 && l.id !== 'shop');
  if (elsewhere) {
    const s = STORE_BY_ID[elsewhere.id];
    return s ? { store: s, qty: elsewhere.qty, isHome: false } : null;
  }
  return null;
}

const KitBuilder = () => {
  const { addToCart, setView, adapterId, shopifySession, persona, shopifyOrders } = useApp();
  const [input, setInput] = useState('');
  const [phase, setPhase] = useState('idle'); // idle | thinking | done
  const [thoughts, setThoughts] = useState([]);
  const [kit, setKit] = useState(null);
  const [itemProducts, setItemProducts] = useState({});
  const [itemStock, setItemStock] = useState({});   // { [itemId]: deliveryPromise }

  // The persona's home store drives the "in stock at X" promise. We read the
  // logged-in Shopify customer's ZIP and map it to the nearest of our 4 stores;
  // a guest defaults to Houston Memorial (77024).
  const customerZip = shopifySession?.profile?.address?.zip || '77024';
  const homeStore = zipToStore(customerZip);

  // Persona-aware sample prompts. Each persona shops a distinct world, so the
  // suggested scenarios should match (Maria → youth team sports, Jake → hunting,
  // Alex → fitness). Falls back to a broad mix for guest / no persona.
  const PERSONA_PROMPTS = {
    hunter: [
      'plan a weekend deer hunt for two people, budget $800',
      'cold-weather tree-stand setup for opening morning',
      'upgrade my optics and range gear for this season',
    ],
    parent: [
      'outfit a youth soccer player starting their first season, kid is 10 years old',
      'gear up two kids for a weekend basketball tournament',
      'restock cleats, socks, and a ball for fall season',
    ],
    fitness: [
      'build a home gym starter kit under $500',
      'marathon training kit — shoes, watch, recovery',
      'refresh my running gear with the best current deals',
    ],
  };
  const guestPrompts = [
    'plan a weekend deer hunt for two people, budget $800',
    'outfit a youth soccer player starting their first season, kid is 10 years old',
    'beach camping trip for a family of four, three nights',
  ];
  const personaName = PERSONAS[persona]?.name;
  const hasSession = (shopifyOrders?.length || 0) > 0 && personaName;
  const prompts = (persona && PERSONA_PROMPTS[persona]) ? PERSONA_PROMPTS[persona] : guestPrompts;

  const findScript = (text) => {
    const t = text.toLowerCase();
    if (t.includes('deer') || t.includes('hunt')) return KIT_SCRIPTS['deer hunt'];
    if (t.includes('soccer')) return KIT_SCRIPTS['soccer player'];
    if (t.includes('beach') || t.includes('camp')) return KIT_SCRIPTS['beach camping'];
    return null;   // no script match — let LLM handle it (or generic fallback)
  };

  const runAgent = async (text) => {
    setInput(text);
    setPhase('thinking');
    setThoughts([]);
    setKit(null);
    setItemStock({});

    // Show a "thinking" placeholder so the page doesn't sit blank while LLM works
    const thinkingPlaceholder = ['Reading the scenario…', 'Cross-referencing catalog…'];
    for (const t of thinkingPlaceholder) {
      await new Promise(r => setTimeout(r, 300));
      setThoughts(s => [...s, t]);
    }

    // 1) Try the real LLM (uses your Cloudflare proxy if configured)
    let kitResult = null;
    if (LLM_CONFIG.enabled) {
      kitResult = await callLLMForKit(text);
    }

    // 2) If LLM unavailable or failed, fall back to a matching script
    if (!kitResult) {
      const script = findScript(text);
      if (script) {
        kitResult = script;
      } else {
        // 3) Last-resort: build a generic kit from the catalog based on category guess
        const lower = text.toLowerCase();
        let guessCategory = 'camping';
        if (lower.includes('hunt') || lower.includes('deer') || lower.includes('rifle')) guessCategory = 'hunting';
        else if (lower.includes('fish') || lower.includes('kayak') || lower.includes('lake')) guessCategory = 'fishing';
        else if (lower.includes('gym') || lower.includes('run') || lower.includes('workout')) guessCategory = 'fitness';
        else if (lower.includes('soccer') || lower.includes('baseball') || lower.includes('basketball')) guessCategory = 'team-sports';
        const pool = CATALOG.filter(p => p.category === guessCategory).slice(0, 5);
        kitResult = {
          thoughts: [
            `Scenario noted: "${text.slice(0, 80)}${text.length > 80 ? '…' : ''}".`,
            `Mapping to our ${guessCategory.replace('-', ' ')} category…`,
            `Selecting a starter set from top-rated SKUs.`,
            `Note: this is a generic recommendation. Connect the AI for tailored picks.`,
          ],
          items: pool.map(p => ({
            id: p.id,
            qty: 1,
            reason: `Top-rated in ${p.subcategory || p.category} — ${p.rating}★ (${p.reviews} reviews).`,
            cat: (p.subcategory || p.category).replace(/^./, c => c.toUpperCase()),
          })),
        };
      }
    }

    // Clear placeholder and stream the real reasoning
    setThoughts([]);
    for (let i = 0; i < kitResult.thoughts.length; i++) {
      await new Promise(r => setTimeout(r, 500));
      setThoughts(s => [...s, kitResult.thoughts[i]]);
    }
    await new Promise(r => setTimeout(r, 400));

    // Fetch the products
    const products = {};
    for (const item of kitResult.items) {
      products[item.id] = await adapter.getProduct(item.id);
    }
    setItemProducts(products);
    setKit(kitResult);
    setPhase('done');

    // Fetch live per-location inventory for the delivery promise (Shopify live
    // only — Mock returns null and we simply omit the promise line).
    if (typeof adapter.getInventoryByLocation === 'function') {
      const stock = {};
      await Promise.all(kitResult.items.map(async (item) => {
        try {
          const inv = await adapter.getInventoryByLocation(item.id);
          const promise = deliveryPromise(inv, homeStore);
          if (promise) stock[item.id] = promise;
        } catch (e) { /* ignore — omit promise for this item */ }
      }));
      setItemStock(stock);
    }
  };

  const reset = () => { setPhase('idle'); setInput(''); setKit(null); setThoughts([]); setItemStock({}); };

  const total = kit ? kit.items.reduce((s, i) => s + (itemProducts[i.id]?.price || 0) * i.qty, 0) : 0;

  const addAll = () => {
    kit.items.forEach(i => addToCart(itemProducts[i.id], i.qty));
    setView('cart');
  };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '56px 32px 80px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
        <Sparkles size={20} color={T.cyan} />
        <div className="mono" style={{ color: T.cyan }}>Plan with AI · Agentic Kit Builder</div>
      </div>
      <h1 className="display" style={{ fontSize: 64, margin: '0 0 20px', color: T.text }}>
        Tell us the scenario.<br />
        <span style={{ fontStyle: 'italic', color: T.text3 }}>We'll build the kit.</span>
      </h1>
      <p style={{ fontSize: 16, color: T.text2, maxWidth: 620, lineHeight: 1.55 }}>
        {hasSession
          ? <>Describe the trip, the event, or the goal, {personaName}. Our agent reasons through your needs — and your {shopifyOrders.length} past orders — picks SKUs from the live catalog, and assembles a ready-to-cart kit with delivery to your {homeStore.city} store.</>
          : <>Describe the trip, the event, or the goal. Our agent reasons through your needs, picks SKUs from the live catalog, and assembles a ready-to-cart kit.</>}
      </p>

      <div style={{
        marginTop: 40,
        background: T.ink2,
        border: `1px solid ${T.hairlineStrong}`,
        padding: 24,
        borderRadius: 12,
        boxShadow: `0 0 40px ${T.cyan}11`,
      }}>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          disabled={phase === 'thinking'}
          placeholder={`e.g. ${prompts[0]}…`}
          style={{
            width: '100%', border: 0, background: 'transparent', resize: 'none',
            fontSize: 17, fontFamily: T.sans, outline: 'none', minHeight: 72,
            color: T.text,
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14, paddingTop: 14, borderTop: `1px solid ${T.hairline}` }}>
          <div className="mono" style={{ color: T.text3 }}>
            {phase === 'thinking' ? <span style={{ color: T.cyan }}>● Agent working…</span> : 'Press Plan when ready'}
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <VoiceMicButton value={input} setValue={setInput} disabled={phase === 'thinking'} size={36} title="Click to describe the scenario by voice" />
            {phase !== 'idle' && (
              <button onClick={reset} style={{
                background: 'transparent',
                border: `1px solid ${T.hairlineStrong}`,
                color: T.text2,
                padding: '10px 16px', cursor: 'pointer', fontSize: 13, borderRadius: 6,
              }}>Reset</button>
            )}
            <button
              onClick={() => input.trim() && runAgent(input)}
              disabled={phase === 'thinking' || !input.trim()}
              style={{
                background: input.trim() && phase !== 'thinking' ? T.gradHero : 'rgba(15,23,42,0.06)',
                color: input.trim() && phase !== 'thinking' ? 'white' : T.text3,
                border: 0,
                padding: '12px 22px',
                cursor: phase === 'thinking' ? 'wait' : (input.trim() ? 'pointer' : 'not-allowed'),
                fontSize: 13, fontWeight: 700,
                display: 'flex', alignItems: 'center', gap: 8,
                borderRadius: 999,
                boxShadow: input.trim() && phase !== 'thinking' ? `0 4px 20px ${T.violet}55, inset 0 1px 0 rgba(255,255,255,0.25)` : 'none',
                transition: 'all 0.2s',
              }}
            >
              {phase === 'thinking' ? <><Loader2 size={14} className="pulse-soft" /> Planning</> : <>Plan with AI <Sparkles size={14} /></>}
            </button>
          </div>
        </div>
      </div>

      {phase === 'idle' && (
        <div style={{ marginTop: 36 }}>
          <div className="mono" style={{ color: T.text3, marginBottom: 16 }}>
            {hasSession ? `Suggested for ${personaName}` : 'Sample prompts'}
          </div>
          {prompts.map(p => (
            <button
              key={p}
              onClick={() => runAgent(p)}
              style={{
                display: 'block', width: '100%', textAlign: 'left',
                background: T.ink2,
                border: `1px solid ${T.hairline}`,
                color: T.text,
                padding: 20, marginBottom: 10,
                cursor: 'pointer',
                borderRadius: 8,
                fontSize: 15,
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = `${T.cyan}44`; e.currentTarget.style.background = 'rgba(25,70,200,0.04)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = T.hairline; e.currentTarget.style.background = T.ink2; }}
            >
              <Sparkles size={12} style={{ display: 'inline', marginRight: 10, color: T.cyan, verticalAlign: 'middle' }} />
              "{p}"
            </button>
          ))}
        </div>
      )}

      {/* Reasoning stream */}
      {phase !== 'idle' && (
        <div style={{
          marginTop: 36,
          background: T.void,
          color: T.text,
          padding: 28,
          borderRadius: 10,
          fontFamily: T.mono,
          fontSize: 13,
          border: `1px solid ${T.cyan}33`,
          boxShadow: `0 0 32px ${T.cyan}11, inset 0 0 0 1px ${T.hairline}`,
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, ${T.cyan}, transparent)` }} />
          <div className="mono" style={{ color: T.cyan, marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: T.cyan, boxShadow: `0 0 8px ${T.cyan}` }} className={phase === 'thinking' ? 'pulse-soft' : ''} />
            Agent reasoning · live
          </div>
          {thoughts.map((t, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} style={{ display: 'flex', gap: 12, marginBottom: 10, lineHeight: 1.55 }}>
              <span style={{ color: T.cyan, flexShrink: 0 }}>›</span>
              <span style={{ color: T.text2 }}>{t}</span>
            </motion.div>
          ))}
          {phase === 'thinking' && (
            <div style={{ display: 'flex', gap: 4, marginTop: 14 }}>
              <span className="think-dot" style={{ width: 6, height: 6, background: T.cyan, borderRadius: '50%' }} />
              <span className="think-dot" style={{ width: 6, height: 6, background: T.cyan, borderRadius: '50%' }} />
              <span className="think-dot" style={{ width: 6, height: 6, background: T.cyan, borderRadius: '50%' }} />
            </div>
          )}
        </div>
      )}

      {/* Assembled kit */}
      {kit && phase === 'done' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: 36 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 22, paddingBottom: 18, borderBottom: `1px solid ${T.hairline}` }}>
            <h2 className="display" style={{ fontSize: 38, margin: 0, color: T.text }}>Your kit</h2>
            <div style={{ fontSize: 14, color: T.text2, textAlign: 'right' }}>
              {kit.items.length} items · <span style={{ color: T.cyan, fontWeight: 700 }}>${total.toFixed(2)}</span>
              {Object.keys(itemStock).length > 0 && (
                <div style={{ fontSize: 11, fontFamily: T.mono, color: T.text3, marginTop: 4 }}>
                  <MapPin size={10} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
                  Delivery to {homeStore.city} ({customerZip})
                </div>
              )}
            </div>
          </div>
          {kit.items.map((item, i) => {
            const p = itemProducts[item.id];
            if (!p) return null;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                style={{
                  display: 'grid', gridTemplateColumns: '80px 1fr auto', gap: 20,
                  padding: 18,
                  background: T.ink2,
                  border: `1px solid ${T.hairline}`,
                  marginBottom: 10,
                  borderRadius: 8,
                  alignItems: 'center',
                }}>
                <div style={{ width: 80, height: 80, overflow: 'hidden', borderRadius: 4, border: `1px solid ${T.hairline}` }}>
                  <ProductIllustration product={p} size="thumb" />
                </div>
                <div>
                  <div className="mono" style={{ color: T.amber, marginBottom: 4 }}>{item.cat} · Qty {item.qty}</div>
                  <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 6, color: T.text }}>{p.name}</div>
                  <div style={{ fontSize: 12, color: T.text2, fontStyle: 'italic', lineHeight: 1.4 }}>
                    <Sparkles size={10} style={{ display: 'inline', marginRight: 6, color: T.cyan, verticalAlign: 'middle' }} />
                    {item.reason}
                  </div>
                  {itemStock[item.id] && (
                    <div style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 8,
                      fontSize: 11, fontFamily: T.mono, fontWeight: 600,
                      color: itemStock[item.id].tone === 'good' ? T.lime : itemStock[item.id].tone === 'bad' ? T.red : T.cyan,
                      background: itemStock[item.id].tone === 'good' ? 'rgba(22,163,74,0.08)' : itemStock[item.id].tone === 'bad' ? 'rgba(200,16,46,0.08)' : 'rgba(37,99,235,0.08)',
                      border: `1px solid ${itemStock[item.id].tone === 'good' ? T.lime : itemStock[item.id].tone === 'bad' ? T.red : T.cyan}33`,
                      padding: '3px 9px', borderRadius: 999,
                    }}>
                      <MapPin size={11} strokeWidth={2.5} />
                      {itemStock[item.id].label}
                    </div>
                  )}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700, fontSize: 17, color: T.text }}>${(p.price * item.qty).toFixed(2)}</div>
                  <div style={{ fontSize: 11, color: T.text3 }}>${p.price.toFixed(2)} ea</div>
                </div>
              </motion.div>
            );
          })}
          <button onClick={addAll} style={{
            marginTop: 24, width: '100%',
            background: T.gradHero, color: 'white',
            border: 0, padding: '20px 28px',
            fontSize: 15, fontWeight: 700,
            cursor: 'pointer', letterSpacing: 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            borderRadius: 999,
            boxShadow: `0 8px 32px ${T.violet}55, 0 0 60px ${T.pink}33, inset 0 1px 0 rgba(255,255,255,0.25)`,
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 12px 48px ${T.violet}77, 0 0 80px ${T.pink}55, inset 0 1px 0 rgba(255,255,255,0.3)`; e.currentTarget.style.transform = 'translateY(-2px)'; }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = `0 8px 32px ${T.violet}55, 0 0 60px ${T.pink}33, inset 0 1px 0 rgba(255,255,255,0.25)`; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            ADD FULL KIT TO CART — ${total.toFixed(2)} <ArrowRight size={16} />
          </button>
        </motion.div>
      )}
    </div>
  );
};

/* ============================================================================
   LIFECYCLE & DISRUPTION — admin panel to fire personalized lifecycle emails
   (delay, cancel, back-in-stock, win-back, price-drop) to the active persona's
   real inbox via the Worker → Resend. Each email is AI-drafted from the
   persona's real Shopify order history.
   ============================================================================ */
const DisruptionPanel = () => {
  const { persona, shopifySession, shopifyOrders, adapterId, agentFastForward, setAgentFastForward } = useApp();
  const [busy, setBusy] = useState(null);     // scenario currently sending
  const [log, setLog] = useState([]);         // [{ scenario, status, msg, ts }]

  const personaName = PERSONAS[persona]?.name;
  const profile = shopifySession?.profile;
  const recipientEmail = profile?.email || PERSONAS[persona]?.shopify?.email;
  const customerZip = profile?.address?.zip || '77024';
  const homeStore = zipToStore(customerZip);
  const liveSession = adapterId === 'shopify' && (shopifyOrders?.length || 0) > 0;

  const SCENARIOS = [
    { key: 'delay', label: 'Order delayed', desc: 'Re-evaluated ETA + good-will gesture', color: T.amber, icon: <Loader2 size={13} /> },
    { key: 'cancel', label: 'Order cancelled', desc: 'Proactive in-stock alternative', color: T.red, icon: <X size={13} /> },
    { key: 'backInStock', label: 'Back in stock', desc: 'Restock nudge for a past purchase', color: T.cyan, icon: <Tag size={13} /> },
    { key: 'winBack', label: 'Win-back', desc: 'Re-engage a lapsed customer', color: T.violet, icon: <Sparkles size={13} /> },
    { key: 'priceDrop', label: 'Price drop', desc: 'Alert on a previously-bought item', color: T.lime, icon: <Flame size={13} /> },
  ];

  const fire = async (scenario) => {
    if (!recipientEmail) {
      setLog(l => [{ scenario, status: 'error', msg: 'No customer email on file for this persona.', ts: Date.now() }, ...l]);
      return;
    }
    setBusy(scenario);
    const focusItem = shopifyOrders?.[0]?.items?.[0] || null;
    const alternate = scenario === 'cancel' ? pickAlternate(focusItem, CATALOG) : null;
    const eta = scenario === 'delay' ? reEvaluatedEta(3) : null;

    // BOPIS: for the panel, default delay = 3 days, so BOPIS applies for both delay & cancel.
    let inStoreOption = null;
    const considerInStore = scenario === 'delay' || scenario === 'cancel';
    if (considerInStore && focusItem?.handle && typeof adapter.getInventoryByLocation === 'function') {
      try {
        const inv = await adapter.getInventoryByLocation(focusItem.handle);
        inStoreOption = findInStoreStock(inv, homeStore);
      } catch { /* omit BOPIS on error */ }
    }

    const email = await draftPersonalizedEmail({
      scenario, persona, customer: profile, orders: shopifyOrders,
      focusItem, alternate, eta, homeStore, delayDays: 3, inStoreOption,
    });
    const res = await sendEmail({ to: recipientEmail, subject: email.subject, html: email.html, text: email.text });
    setBusy(null);
    setLog(l => [{
      scenario,
      status: res.success ? 'sent' : 'error',
      msg: res.success ? `"${email.subject}" → ${recipientEmail}` : (res.error || 'Send failed'),
      ts: Date.now(),
    }, ...l].slice(0, 6));
  };

  return (
    <div style={{
      marginTop: 28,
      background: 'linear-gradient(135deg, rgba(200,16,46,0.05) 0%, rgba(200,16,46,0.04) 100%)',
      border: `1px solid ${T.amber}33`,
      borderRadius: 12, overflow: 'hidden',
    }}>
      <div style={{
        padding: '16px 22px', borderBottom: `1px solid ${T.hairline}`,
        background: `linear-gradient(90deg, ${T.amber}18 0%, transparent 60%)`,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8,
      }}>
        <strong style={{ fontSize: 14, color: T.text, display: 'flex', alignItems: 'center', gap: 10 }}>
          <Sparkles size={14} color={T.amber} />
          Lifecycle & Disruption — agentic recovery emails
        </strong>
        <span className="mono" style={{ color: liveSession ? T.lime : T.text3, fontSize: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: liveSession ? T.lime : T.text3, boxShadow: liveSession ? `0 0 8px ${T.lime}` : 'none' }} />
          {liveSession ? `LIVE · ${personaName} · ${recipientEmail}` : 'Switch to Shopify + a persona to enable'}
        </span>
      </div>

      <div style={{ padding: 22 }}>
        <p style={{ color: T.text2, fontSize: 13, lineHeight: 1.5, margin: '0 0 18px', maxWidth: 720 }}>
          Each email is drafted live by the AI from {personaName ? `${personaName}'s` : 'the customer\u2019s'} real order history, then sent to their actual inbox through the secure Worker → Resend. Delay emails include a re-evaluated ETA; cancellations propose an in-stock alternative.
        </p>

        {/* Autonomous agent fast-forward — compresses the realistic abandoned-cart
            clock so the always-on agent's escalation is watchable on stage. */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
          background: T.ink2, border: `1px solid ${T.hairline}`, borderRadius: 10,
          padding: '12px 16px', marginBottom: 18,
        }}>
          <span style={{ fontSize: 12, fontFamily: T.mono, color: T.text2, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <Sparkles size={13} color={T.cyan} /> Autonomous cart-recovery agent — clock speed:
          </span>
          {[
            { mult: 1, label: 'Real-time' },
            { mult: 60, label: '1 min ≈ 1 hr' },
            { mult: 240, label: '15 sec ≈ 1 hr' },
          ].map(opt => (
            <button
              key={opt.mult}
              onClick={() => setAgentFastForward(opt.mult)}
              style={{
                background: agentFastForward === opt.mult ? T.cyan : 'transparent',
                color: agentFastForward === opt.mult ? T.void : T.text2,
                border: `1px solid ${agentFastForward === opt.mult ? T.cyan : T.hairlineStrong}`,
                padding: '6px 12px', fontSize: 11, fontWeight: 600, borderRadius: 999, cursor: 'pointer',
              }}>
              {opt.label}
            </button>
          ))}
          <span style={{ fontSize: 11, color: T.text3, fontFamily: T.mono }}>
            stage 1 nudge @ {Math.round(30 / agentFastForward * 60)}s · discount @ {Math.round(120 / agentFastForward * 60)}s after add-to-cart
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
          {SCENARIOS.map(s => (
            <button
              key={s.key}
              onClick={() => fire(s.key)}
              disabled={!liveSession || busy != null}
              style={{
                textAlign: 'left', background: T.ink2,
                border: `1px solid ${liveSession ? s.color + '44' : T.hairline}`,
                borderRadius: 10, padding: '14px 16px',
                cursor: liveSession && busy == null ? 'pointer' : 'not-allowed',
                opacity: liveSession ? 1 : 0.5, transition: 'all 0.2s',
              }}
              onMouseEnter={e => { if (liveSession && busy == null) { e.currentTarget.style.borderColor = s.color; e.currentTarget.style.background = 'rgba(15,23,42,0.05)'; } }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = liveSession ? s.color + '44' : T.hairline; e.currentTarget.style.background = T.ink2; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: s.color, fontWeight: 700, fontSize: 13, marginBottom: 4 }}>
                {busy === s.key ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : s.icon}
                {s.label}
              </div>
              <div style={{ color: T.text3, fontSize: 11 }}>{s.desc}</div>
            </button>
          ))}
        </div>

        {log.length > 0 && (
          <div style={{ marginTop: 18, borderTop: `1px solid ${T.hairline}`, paddingTop: 14 }}>
            <div className="mono" style={{ color: T.text3, fontSize: 10, marginBottom: 8 }}>Recent sends</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {log.map((e, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontFamily: T.mono, color: e.status === 'sent' ? T.lime : T.red }}>
                  {e.status === 'sent' ? <Check size={12} strokeWidth={3} /> : <X size={12} />}
                  <span style={{ color: T.text3 }}>{SCENARIOS.find(s => s.key === e.scenario)?.label}:</span>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.msg}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* ============================================================================
   MERCHANDISER ADMIN
   ============================================================================ */
// =============================================================================
//   DEMO MODE CONTROL — hidden admin toggle (lives in the admin-only Merch Tool)
//   Flips the worker's durable demo-mode flag on/off via the authenticated admin
//   endpoint, and shows today's AI / KV usage against the caps. The ADMIN_TOKEN
//   is entered at runtime and kept in sessionStorage — never baked into the
//   public bundle (so it can't be read from DevTools).
// =============================================================================
const DEMO_TOKEN_KEY = 'demo-admin-token';

const DemoModeControl = () => {
  const [token, setToken] = useState(() => { try { return sessionStorage.getItem(DEMO_TOKEN_KEY) || ''; } catch { return ''; } });
  const [tokenInput, setTokenInput] = useState('');
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const base = (typeof _workerBase === 'function') ? _workerBase() : '';

  const call = async (qs) => {
    if (!base) { setError('No proxy URL configured.'); return; }
    setLoading(true); setError(null);
    try {
      const res = await fetch(`${base}/v1/admin/${qs}`);
      if (res.status === 401) { setError('Invalid admin token.'); setStatus(null); return; }
      const data = await res.json().catch(() => null);
      if (data) setStatus(data);
    } catch { setError('Could not reach the worker.'); }
    finally { setLoading(false); }
  };
  const refresh = (tok) => { const t = tok ?? token; if (t) call(`status?token=${encodeURIComponent(t)}`); };
  const toggle  = (mode) => { if (token) call(`demo?token=${encodeURIComponent(token)}&mode=${mode}`); };

  useEffect(() => { if (token) refresh(token); /* on mount only */ }, []); // eslint-disable-line

  const unlock = () => {
    const t = tokenInput.trim(); if (!t) return;
    try { sessionStorage.setItem(DEMO_TOKEN_KEY, t); } catch {}
    setToken(t); setTokenInput(''); refresh(t);
  };
  const forget = () => {
    try { sessionStorage.removeItem(DEMO_TOKEN_KEY); } catch {}
    setToken(''); setStatus(null); setError(null);
  };

  const on = status?.demoMode === 'on';
  const u = status?.usage;

  return (
    <div style={{
      marginTop: 24, padding: '16px 18px',
      background: T.glassSurface, border: `1px solid ${T.hairlineStrong}`,
      borderRadius: 12, maxWidth: 620,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <Settings size={15} color={T.text2} />
        <span style={{ fontWeight: 700, fontSize: 14, color: T.text }}>Demo Mode</span>
        <span className="mono" style={{ fontSize: 9, color: T.text3, border: `1px solid ${T.hairline}`, borderRadius: 999, padding: '1px 7px' }}>ADMIN</span>
        {status && (
          <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: on ? T.green : T.text3 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: on ? T.green : T.text3 }} />
            {on ? 'ON' : 'OFF'}
          </span>
        )}
      </div>
      <p style={{ fontSize: 12, color: T.text2, margin: '0 0 12px', lineHeight: 1.5 }}>
        Controls AI + KV usage. When off, the storefront still browses but the AI, email, and lifecycle agent are paused.
      </p>

      {!token ? (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            type="password" placeholder="Admin token" value={tokenInput}
            onChange={e => setTokenInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') unlock(); }}
            style={{ flex: 1, padding: '9px 12px', background: T.void, border: `1px solid ${T.hairlineStrong}`, borderRadius: 8, color: T.text, fontSize: 13 }}
          />
          <button onClick={unlock} style={{ padding: '9px 16px', background: T.violet, color: '#fff', border: 0, borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Unlock</button>
        </div>
      ) : (
        <div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => toggle(on ? 'off' : 'on')}
              disabled={loading}
              style={{
                padding: '10px 18px', border: 0, borderRadius: 999, cursor: loading ? 'wait' : 'pointer',
                fontSize: 13, fontWeight: 700, color: '#fff',
                background: on ? T.red : T.green,
                display: 'inline-flex', alignItems: 'center', gap: 8,
              }}>
              {loading ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : null}
              {on ? 'Turn demo OFF' : 'Turn demo ON'}
            </button>
            <button onClick={() => refresh()} disabled={loading}
              style={{ padding: '10px 14px', background: 'transparent', border: `1px solid ${T.hairlineStrong}`, borderRadius: 999, color: T.text2, fontSize: 12, cursor: 'pointer' }}>
              Refresh
            </button>
            <button onClick={forget}
              style={{ marginLeft: 'auto', background: 'transparent', border: 0, color: T.text3, fontSize: 11, cursor: 'pointer', textDecoration: 'underline' }}>
              Forget token
            </button>
          </div>
          {u && (
            <div className="mono" style={{ marginTop: 12, fontSize: 11, color: T.text2, lineHeight: 1.7 }}>
              AI calls: <strong style={{ color: u.aiCalls >= u.aiCap ? T.red : T.text }}>{u.aiCalls}/{u.aiCap}</strong>
              {'   ·   '}
              KV writes: <strong style={{ color: u.kvWrites >= u.kvCap ? T.red : T.text }}>{u.kvWrites}/{u.kvCap}</strong>
              <br />
              <span style={{ color: T.text3 }}>resets {u.resetsAtUtc ? new Date(u.resetsAtUtc).toLocaleString() : 'at UTC midnight'}</span>
            </div>
          )}
        </div>
      )}
      {error && <div style={{ marginTop: 10, fontSize: 12, color: T.red }}>{error}</div>}
    </div>
  );
};

const MerchTool = () => {
  // pinnedByCategory and heroOverrides are now lifted to App context so the
  // storefront (HomePage, CategoryPage) can see them. MerchTool reads + writes
  // through the same source of truth.
  const {
    adapterId, setAdapter, llmEnabled, setLlmKey,
    pinnedByCategory, setPinnedByCategory,
    heroOverrides, setHeroOverrides,
    pdpOverrides, setPdpOverrides,
  } = useApp();
  const [rules, setRules] = useState(null);
  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState('');
  const [saved, setSaved] = useState(false);
  const [adapterSaved, setAdapterSaved] = useState(false);
  const [llmDraft, setLlmDraft] = useState('');
  const [llmSaved, setLlmSaved] = useState(false);

  useEffect(() => { adapter.getMerchandisingRules().then(setRules); }, [adapterId]);

  // Resolve a SKU string (e.g. "SCOPE-VTX-4-16") or product ID (e.g. "h001") to a product
  const resolveProduct = (skuOrId) => CATALOG.find(p => p.id === skuOrId || p.sku === skuOrId);

  // Apply an LLM-issued suggestion (banner copy or SKU pin/unpin)
  const applySuggestion = async (suggestion) => {
    if (suggestion.kind === 'banner' && suggestion.persona && suggestion.text) {
      const updated = { ...rules['home-hero'], [suggestion.persona]: suggestion.text };
      await adapter.updateMerchandisingRule('home-hero', updated);
      setRules(r => ({ ...r, 'home-hero': updated }));
      // Mirror to app-level state so HomePage picks up the change
      setHeroOverrides(curr => ({ ...curr, [suggestion.persona]: suggestion.text }));
      return true;
    }
    if (suggestion.kind === 'pinSkus' && Array.isArray(suggestion.skus)) {
      // Group incoming SKUs by their actual category from the catalog.
      // If the suggestion has an explicit category, use it as a fallback for items we can't resolve.
      const grouped = {};
      for (const s of suggestion.skus) {
        const product = resolveProduct(s);
        const sku = product ? product.sku : s;
        const cat = product?.category || suggestion.category;
        if (!cat) continue;   // can't pin to unknown category
        grouped[cat] = grouped[cat] || [];
        grouped[cat].push(sku);
      }
      setPinnedByCategory(curr => {
        const next = { ...curr };
        for (const [cat, skus] of Object.entries(grouped)) {
          next[cat] = Array.from(new Set([...(next[cat] || []), ...skus]));
        }
        return next;
      });
      return true;
    }
    if (suggestion.kind === 'unpinSkus' && Array.isArray(suggestion.skus)) {
      const skusToRemove = new Set(
        suggestion.skus.map(s => {
          const p = resolveProduct(s);
          return p ? p.sku : s;
        })
      );
      setPinnedByCategory(curr => {
        const next = {};
        for (const [cat, list] of Object.entries(curr)) {
          next[cat] = list.filter(sku => !skusToRemove.has(sku));
        }
        return next;
      });
      return true;
    }
    if (suggestion.kind === 'pdpModule' && suggestion.persona) {
      // PDP module override — admin (or AI) is changing what appears in the
      // "Personalized for X" section on the product detail page. Either title
      // or items (or both) may be provided. Resolve item entries to product
      // IDs since shoppers' code expects IDs (h001, t002, etc) not SKUs.
      const resolvedItems = Array.isArray(suggestion.items)
        ? suggestion.items
            .map(s => {
              const p = resolveProduct(s);
              return p ? p.id : null;
            })
            .filter(Boolean)
        : null;
      // Update local rules so the editor reflects the change immediately
      const currentRule = rules['pdp-module']?.[suggestion.persona] || {};
      const updatedRule = { ...currentRule };
      if (suggestion.title) updatedRule.title = suggestion.title;
      if (resolvedItems && resolvedItems.length > 0) updatedRule.items = resolvedItems;
      const updated = { ...rules['pdp-module'], [suggestion.persona]: updatedRule };
      await adapter.updateMerchandisingRule('pdp-module', updated);
      setRules(r => ({ ...r, 'pdp-module': updated }));
      // Mirror to app-level state so PDPPage picks up the change
      setPdpOverrides(curr => {
        const prev = curr[suggestion.persona] || {};
        const next = { ...prev };
        if (suggestion.title) next.title = suggestion.title;
        if (resolvedItems && resolvedItems.length > 0) next.items = resolvedItems;
        return { ...curr, [suggestion.persona]: next };
      });
      return true;
    }
    return false;
  };

  // Direct (non-AI) PDP module update — used by the inline editor UI in the
  // Merch Tool. Same shape and effect as applySuggestion({ kind: 'pdpModule' }),
  // but accepts the persona explicitly and writes both rule state and
  // app-level override in one call.
  const updatePdpModule = (persona, { title, items } = {}) => {
    const currentRule = rules['pdp-module']?.[persona] || {};
    const updatedRule = { ...currentRule };
    if (title !== undefined) updatedRule.title = title;
    if (items !== undefined) updatedRule.items = items;
    const updated = { ...rules['pdp-module'], [persona]: updatedRule };
    adapter.updateMerchandisingRule('pdp-module', updated);
    setRules(r => ({ ...r, 'pdp-module': updated }));
    setPdpOverrides(curr => {
      const prev = curr[persona] || {};
      const next = { ...prev };
      if (title !== undefined) next.title = title;
      if (items !== undefined) next.items = items;
      return { ...curr, [persona]: next };
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const save = async (key, persona) => {
    const updated = { ...rules[key], [persona]: draft };
    await adapter.updateMerchandisingRule(key, updated);
    setRules(r => ({ ...r, [key]: updated }));
    // Also write into app-level heroOverrides so HomePage picks up the change.
    // Currently only home-hero is wired through to the storefront; other rule
    // types (pdp-content, etc) still live in MerchTool-local state.
    if (key === 'home-hero') {
      setHeroOverrides(curr => ({ ...curr, [persona]: draft }));
    }
    setEditing(null);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const switchAdapter = (id) => {
    setAdapter(id);
    setAdapterSaved(true);
    setTimeout(() => setAdapterSaved(false), 2000);
  };

  const applyLlmKey = () => {
    setLlmKey(llmDraft);
    setLlmDraft('');
    setLlmSaved(true);
    setTimeout(() => setLlmSaved(false), 2500);
  };

  const clearLlmKey = () => {
    setLlmKey('');
    setLlmSaved(true);
    setTimeout(() => setLlmSaved(false), 2500);
  };

  if (!rules) return <div style={{ padding: 80, color: T.text2 }}>Loading…</div>;

  const currentAdapter = ADAPTER_DESCRIBE[adapterId];

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '56px 32px 80px' }}>
      <div className="mono" style={{ color: T.cyan, marginBottom: 10 }}>Admin · Merchandiser Tool</div>
      <h1 className="display" style={{ fontSize: 56, margin: '0 0 12px', color: T.text }}>Live Merchandising</h1>
      <p style={{ fontSize: 15, color: T.text2, maxWidth: 620, lineHeight: 1.55 }}>
        Edit homepage banners, swap commerce backends, and configure the AI assistant. All changes are live.
      </p>

      <DemoModeControl />

      <AnimatePresence>
        {(saved || adapterSaved || llmSaved) && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{
            marginTop: 24, padding: '12px 18px',
            background: 'rgba(22,163,74,0.08)',
            border: `1px solid ${T.green}44`,
            color: T.green,
            borderRadius: 8,
            display: 'flex', alignItems: 'center', gap: 10, fontSize: 14,
          }}>
            <Check size={16} /> {
              llmSaved ? (llmEnabled ? 'AI Agent connected — chat is now LLM-powered.' : 'AI Agent key cleared — chat will use scripted responses.')
              : adapterSaved ? `Switched to ${currentAdapter.name} — storefront re-fetching from new backend.`
              : 'Saved — refresh storefront to see changes.'
            }
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---------- AI ASSISTANT PANEL ---------- */}
      <div style={{
        marginTop: 36,
        background: 'linear-gradient(135deg, rgba(25,70,200,0.08) 0%, rgba(200,16,46,0.04) 100%)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: `1px solid ${T.violet}33`,
        borderRadius: 12,
        overflow: 'hidden',
      }}>
        <div style={{
          padding: '16px 22px',
          borderBottom: `1px solid ${T.hairline}`,
          background: `linear-gradient(90deg, ${T.violet}22 0%, transparent 60%)`,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <strong style={{ fontSize: 14, color: T.text, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Sparkles size={14} color={T.violet} />
            AI Assistant (A2UI)
          </strong>
          <span className="mono" style={{
            color: llmEnabled ? T.lime : T.text3,
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: '50%',
              background: llmEnabled ? T.lime : T.text3,
              boxShadow: llmEnabled ? `0 0 8px ${T.lime}` : 'none',
            }} />
            {llmEnabled
              ? (LLM_CONFIG.source === 'proxy'
                  ? 'LIVE · AI agent via secure proxy'
                  : `LIVE · AI agent · key from ${LLM_CONFIG.source === 'env' ? '.env.local / build' : 'browser storage'}`)
              : 'SCRIPTED'}
          </span>
        </div>
        <div style={{ padding: 22 }}>
          <div style={{ fontSize: 13, color: T.text2, marginBottom: 16, lineHeight: 1.55 }}>
            The chat widget is an A2UI agent — it doesn't just answer, it <strong style={{ color: T.text }}>drives the storefront</strong>. Customers can search, filter, navigate to products, add to cart, and even check out — all through the chat.
            {LLM_CONFIG.source === 'proxy' ? (
              <>
                <br /><br />
                <strong style={{ color: T.lime }}>Proxy mode active.</strong>{' '}
                <span style={{ color: T.text3 }}>
                  Requests are forwarded through your Cloudflare Worker — the API key never reaches the browser. Safe for the public URL.
                </span>
              </>
            ) : (
              <>
                <br /><br />
                <strong style={{ color: T.text }}>Three ways to wire a key:</strong>{' '}
                <span style={{ color: T.text3 }}>
                  (a) <code style={{ background: 'rgba(15,23,42,0.12)', padding: '1px 6px', fontFamily: T.mono, color: T.amber, borderRadius: 3 }}>VITE_PROXY_URL</code> in .env.local or GitHub Secret (recommended — uses Cloudflare Worker, key stays server-side),
                  (b) <code style={{ background: 'rgba(15,23,42,0.12)', padding: '1px 6px', fontFamily: T.mono, color: T.amber, borderRadius: 3 }}>VITE_ANTHROPIC_KEY</code> for direct mode (laptop dev only — exposes key),
                  (c) paste here at runtime (browser-only, gone when tab closes).
                </span>
              </>
            )}
          </div>
          {LLM_CONFIG.source === 'proxy' ? (
            <div style={{
              padding: 16,
              background: 'rgba(22,163,74,0.06)',
              border: `1px solid ${T.lime}44`,
              borderRadius: 8,
              fontSize: 12, color: T.text2, lineHeight: 1.6,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Check size={14} color={T.lime} />
                <strong style={{ color: T.lime, fontFamily: T.mono, letterSpacing: 0.5, fontSize: 10 }}>PROXY CONNECTED</strong>
              </div>
              <span style={{ fontFamily: T.mono, fontSize: 11, color: T.text3 }}>
                {LLM_CONFIG.proxyUrl}
              </span>
              <br /><br />
              No key is held in this browser. The Worker handles authentication and rate-limiting server-side.
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input
                  type="password"
                  value={llmDraft}
                  onChange={e => setLlmDraft(e.target.value)}
                  placeholder={llmEnabled ? '••••••••••• (already configured)' : 'sk-ant-api03-...'}
                  style={{
                    flex: 1,
                    padding: 14,
                    background: 'rgba(15,23,42,0.12)',
                    border: `1px solid ${T.glassBorder}`,
                    color: T.text,
                    fontSize: 13, fontFamily: T.mono,
                    borderRadius: 8, outline: 'none',
                  }}
                />
                <button onClick={applyLlmKey} disabled={!llmDraft.trim()} style={{
                  background: llmDraft.trim() ? T.gradHero : 'rgba(15,23,42,0.06)',
                  color: llmDraft.trim() ? 'white' : T.text3,
                  border: 0,
                  padding: '14px 22px', fontSize: 13, fontWeight: 700,
                  cursor: llmDraft.trim() ? 'pointer' : 'not-allowed',
                  borderRadius: 8,
                  display: 'flex', alignItems: 'center', gap: 6,
                  boxShadow: llmDraft.trim() ? `0 4px 16px ${T.violet}44` : 'none',
                  transition: 'all 0.2s',
                }}><Sparkles size={12} /> Connect</button>
                {llmEnabled && (
                  <button onClick={clearLlmKey} style={{
                    background: 'transparent',
                    border: `1px solid ${T.hairlineStrong}`,
                    color: T.text2,
                    padding: '14px 18px', fontSize: 12, cursor: 'pointer', borderRadius: 8,
                  }}>Disconnect</button>
                )}
              </div>
              <div style={{ marginTop: 14, padding: 14, background: 'rgba(0,0,0,0.2)', borderRadius: 8, fontSize: 11, lineHeight: 1.6, color: T.text3, fontFamily: T.mono }}>
                <strong style={{ color: T.amber, letterSpacing: 0.5 }}>SECURITY NOTE:</strong> the key is stored only in this browser tab. It's not committed or transmitted anywhere except api.anthropic.com. For stage use only — never expose on a public laptop.
              </div>
            </>
          )}
          <div style={{ marginTop: 14, fontSize: 11, color: T.text3 }}>
            <strong style={{ color: T.text2 }}>A2UI action surface:</strong> showResults · navigate · openProduct · applyFilter · addToCart · viewCart · checkout · setPersona
          </div>
        </div>
      </div>

      {/* ---------- COMMERCE ADAPTER PANEL ---------- */}
      <div style={{ marginTop: 28, background: T.ink2, border: `1px solid ${T.hairline}`, borderRadius: 10, overflow: 'hidden' }}>
        <div style={{
          padding: '16px 22px',
          borderBottom: `1px solid ${T.hairline}`,
          background: 'rgba(25,70,200,0.04)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <strong style={{ fontSize: 14, color: T.text }}>Commerce Adapter</strong>
          <span className="mono" style={{ color: T.cyan }}>Live swap · CommerceAdapter interface</span>
        </div>
        <div style={{ padding: 22 }}>
          <div style={{ fontSize: 13, color: T.text2, marginBottom: 18, lineHeight: 1.55 }}>
            The storefront talks to a single <code style={{ background: T.ink3, padding: '2px 8px', fontFamily: T.mono, fontSize: 12, color: T.cyan, borderRadius: 3 }}>CommerceAdapter</code> interface.
            Pick which implementation services product, search, cart, and merchandising calls.
            Switching is live — all pages re-fetch from the selected backend on the next render.
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
            {Object.entries(ADAPTER_DESCRIBE).map(([id, desc]) => {
              const isActive = adapterId === id;
              return (
                <button
                  key={id}
                  onClick={() => !isActive && switchAdapter(id)}
                  style={{
                    textAlign: 'left',
                    background: isActive ? 'rgba(25,70,200,0.08)' : T.ink3,
                    color: T.text,
                    border: isActive ? `1px solid ${T.cyan}66` : `1px solid ${T.hairline}`,
                    padding: 20,
                    borderRadius: 8,
                    cursor: isActive ? 'default' : 'pointer',
                    position: 'relative',
                    boxShadow: isActive ? `0 0 24px ${T.cyan}22` : 'none',
                    transition: 'all 0.2s',
                  }}
                >
                  {isActive && (
                    <span style={{
                      position: 'absolute', top: 14, right: 14,
                      background: T.cyan, color: T.void,
                      padding: '4px 10px', fontSize: 10, fontWeight: 700,
                      letterSpacing: 1, borderRadius: 3,
                      boxShadow: `0 0 12px ${T.cyan}66`,
                    }}>ACTIVE</span>
                  )}
                  <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6, color: T.text }}>{desc.name}</div>
                  <div className="mono" style={{ marginBottom: 14, color: isActive ? T.cyan : T.text3 }}>Mode: {desc.mode}</div>
                  {id === 'mock' && (
                    <div style={{ fontSize: 12, lineHeight: 1.55, color: T.text2 }}>
                      In-memory demo catalog with simulated latency.
                      Best for stage and offline demos.
                    </div>
                  )}
                  {id === 'commercetools' && (
                    <div style={{ fontSize: 12, lineHeight: 1.55, color: T.text2 }}>
                      commercetools-shaped adapter with OAuth and Product Projection Search.
                      {desc.mode === 'LIVE'
                        ? <> Wired to <strong style={{ color: T.text }}>{desc.projectKey}</strong>.</>
                        : <> Currently in STUB mode — fill <code style={{ background: T.void, padding: '0 6px', fontSize: 11, fontFamily: T.mono, color: T.amber, borderRadius: 2 }}>CT_CONFIG</code> for live API.</>}
                    </div>
                  )}
                  {id === 'shopify' && (
                    <div style={{ fontSize: 12, lineHeight: 1.55, color: T.text2 }}>
                      Shopify Storefront API (GraphQL). Browser-safe public token, real catalog.
                      {desc.mode === 'LIVE'
                        ? <> Live store: <strong style={{ color: T.text }}>{desc.backend}</strong>.</>
                        : <> STUB mode — fill <code style={{ background: T.void, padding: '0 6px', fontSize: 11, fontFamily: T.mono, color: T.amber, borderRadius: 2 }}>SHOPIFY_CONFIG</code> for live API.</>}
                    </div>
                  )}
                  {desc.locale && (
                    <div className="mono" style={{ marginTop: 14, fontSize: 10, color: isActive ? T.cyan : T.text3 }}>
                      {desc.locale} · {desc.currency}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
          <div style={{
            marginTop: 18, padding: 14,
            background: T.void,
            border: `1px solid ${T.hairline}`,
            fontSize: 11, fontFamily: T.mono, color: T.text2,
            borderRadius: 6,
          }}>
            <strong style={{ color: T.cyan }}>Active interface:</strong> getProduct · getProducts · getCategory · search · visualSearch · addToCart · getMerchandisingRules · updateMerchandisingRule
          </div>
        </div>
      </div>

      <div style={{ marginTop: 28, background: T.ink2, border: `1px solid ${T.hairline}`, borderRadius: 10, overflow: 'hidden' }}>
        <div style={{
          padding: '16px 22px',
          borderBottom: `1px solid ${T.hairline}`,
          background: 'rgba(212,161,78,0.04)',
          display: 'flex', justifyContent: 'space-between',
        }}>
          <strong style={{ fontSize: 14, color: T.text }}>Home Hero Banner</strong>
          <span className="mono" style={{ color: T.amber }}>4 variants (incl. guest)</span>
        </div>
        {rules['home-hero'] && ['hunter', 'parent', 'fitness', 'guest']
          .filter(p => rules['home-hero'][p] !== undefined)
          .map(persona => {
          const text = rules['home-hero'][persona];
          return (
          <div key={persona} style={{
            display: 'grid', gridTemplateColumns: '180px 1fr auto', gap: 18,
            padding: 20, borderBottom: `1px solid ${T.hairline}`,
            alignItems: 'center',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 24 }}>{PERSONAS[persona].icon}</span>
              <strong style={{ fontSize: 14, color: T.text }}>{PERSONAS[persona].name}</strong>
            </div>
            {editing === `home-hero-${persona}` ? (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: T.void,
                border: `1px solid ${T.cyan}66`,
                borderRadius: 6,
                padding: '0 8px 0 0',
                boxShadow: `0 0 16px ${T.cyan}22`,
              }}>
                <input
                  value={draft}
                  onChange={e => setDraft(e.target.value)}
                  autoFocus
                  style={{
                    flex: 1,
                    padding: 12,
                    background: 'transparent',
                    border: 0,
                    color: T.text,
                    fontSize: 14,
                    fontFamily: T.sans,
                    outline: 'none',
                  }} />
                <VoiceMicButton value={draft} setValue={setDraft} size={34} title="Click to dictate banner copy" />
              </div>
            ) : (
              <div style={{ fontSize: 14, color: T.text }}>{text}</div>
            )}
            <div style={{ display: 'flex', gap: 8 }}>
              {editing === `home-hero-${persona}` ? (
                <>
                  <button onClick={() => save('home-hero', persona)} style={{
                    background: T.cyan, color: T.void, border: 0,
                    padding: '8px 14px', fontSize: 12, fontWeight: 700,
                    cursor: 'pointer', borderRadius: 6,
                    display: 'flex', alignItems: 'center', gap: 6,
                    boxShadow: `0 0 12px ${T.cyan}55`,
                  }}><Save size={12} /> Save</button>
                  <button onClick={() => setEditing(null)} style={{
                    background: 'transparent',
                    border: `1px solid ${T.hairlineStrong}`,
                    color: T.text2,
                    padding: '8px 14px', fontSize: 12, cursor: 'pointer', borderRadius: 6,
                  }}>Cancel</button>
                </>
              ) : (
                <button onClick={() => { setEditing(`home-hero-${persona}`); setDraft(text); }} style={{
                  background: 'rgba(15,23,42,0.05)',
                  border: `1px solid ${T.hairline}`,
                  color: T.text,
                  padding: '8px 14px', fontSize: 12, cursor: 'pointer', borderRadius: 6,
                  display: 'flex', alignItems: 'center', gap: 6,
                }}><Edit3 size={12} /> Edit</button>
              )}
            </div>
          </div>
        );})}
      </div>

      <div style={{ marginTop: 28 }}>
        <div style={{
          padding: '16px 22px',
          background: 'rgba(255,90,69,0.04)',
          border: `1px solid ${T.hairline}`,
          borderRadius: '10px 10px 0 0',
          display: 'flex', justifyContent: 'space-between',
        }}>
          <strong style={{ fontSize: 14, color: T.text }}>Category Sort Overrides</strong>
          <span className="mono" style={{ color: T.red }}>Pin SKUs to top · per category</span>
        </div>
        <div style={{
          padding: 22,
          fontSize: 13, color: T.text2,
          background: T.ink2,
          borderLeft: `1px solid ${T.hairline}`,
          borderRight: `1px solid ${T.hairline}`,
        }}>
          Pinned SKUs override the personalized sort and appear first for all users in that category.
        </div>
        {CATEGORY_LIST.map((cat, idx) => {
          const list = pinnedByCategory[cat.id] || [];
          const isLast = idx === CATEGORY_LIST.length - 1;
          return (
            <div key={cat.id} style={{
              padding: '18px 22px',
              background: T.ink2,
              borderLeft: `1px solid ${T.hairline}`,
              borderRight: `1px solid ${T.hairline}`,
              borderBottom: `1px solid ${T.hairline}`,
              borderRadius: isLast ? '0 0 10px 10px' : 0,
            }}>
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                marginBottom: 12,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 18 }}>{cat.icon}</span>
                  <strong style={{ fontSize: 13, color: T.text }}>{cat.label}</strong>
                  <span className="mono" style={{ fontSize: 10, color: T.text3, padding: '2px 8px', background: T.void, border: `1px solid ${T.hairline}`, borderRadius: 999 }}>
                    {list.length} pinned
                  </span>
                </div>
                <CategoryPinAdder
                  category={cat.id}
                  currentPins={list}
                  onPin={(sku) => setPinnedByCategory(curr => ({ ...curr, [cat.id]: Array.from(new Set([...(curr[cat.id] || []), sku])) }))}
                />
              </div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {list.map(sku => (
                  <div key={sku} style={{
                    padding: '8px 12px',
                    background: T.void,
                    border: `1px solid ${T.hairline}`,
                    fontSize: 11, fontFamily: T.mono, color: T.text,
                    display: 'flex', alignItems: 'center', gap: 8, borderRadius: 999,
                  }}>
                    <Pin size={11} color={T.amber} />
                    {sku}
                    <button
                      onClick={() => setPinnedByCategory(curr => ({ ...curr, [cat.id]: (curr[cat.id] || []).filter(s => s !== sku) }))}
                      style={{ background: 'none', border: 0, cursor: 'pointer', color: T.text3, padding: 0, display: 'flex' }}
                      title="Unpin"
                    >
                      <X size={11} />
                    </button>
                  </div>
                ))}
                {list.length === 0 && (
                  <div style={{ fontSize: 11, color: T.text3, fontStyle: 'italic' }}>
                    No pins. Add one above or ask the AI for {cat.label.toLowerCase()} suggestions.
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ---------- PDP PERSONALIZED MODULE EDITOR ---------- */}
      {/* This controls the "Personalized for X" section on every product
          detail page. Per persona (incl. guest), admin can edit the section
          title and which 3 products appear. Mirrors the home-hero section
          visually but operates on PDP module data. */}
      <div style={{ marginTop: 28, background: T.ink2, border: `1px solid ${T.hairline}`, borderRadius: 10, overflow: 'hidden' }}>
        <div style={{
          padding: '16px 22px',
          borderBottom: `1px solid ${T.hairline}`,
          background: 'rgba(25,70,200,0.04)',
          display: 'flex', justifyContent: 'space-between',
        }}>
          <strong style={{ fontSize: 14, color: T.text }}>PDP Personalized Module</strong>
          <span className="mono" style={{ color: T.violet }}>4 persona variants · title + 3 products each</span>
        </div>
        {['hunter', 'parent', 'fitness', 'guest'].map(personaKey => {
          const mod = rules['pdp-module']?.[personaKey] || { title: '', items: [] };
          const isEditingTitle = editing === `pdp-title-${personaKey}`;
          return (
            <div key={personaKey} style={{
              padding: '18px 22px', borderBottom: `1px solid ${T.hairline}`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <span style={{ fontSize: 22 }}>{PERSONAS[personaKey].icon}</span>
                <strong style={{ fontSize: 14, color: T.text }}>{PERSONAS[personaKey].name}</strong>
                <span style={{ fontSize: 11, color: T.text3, marginLeft: 'auto' }}>{(mod.items || []).length} of 3 products</span>
              </div>

              {/* Title row — editable in place, with voice mic */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14,
                background: T.void, border: `1px solid ${T.hairline}`, borderRadius: 6,
                padding: '4px 4px 4px 12px',
              }}>
                <span style={{ fontSize: 11, color: T.text3, minWidth: 60 }}>TITLE</span>
                {isEditingTitle ? (
                  <>
                    <input
                      value={draft}
                      onChange={e => setDraft(e.target.value)}
                      autoFocus
                      style={{
                        flex: 1, background: 'transparent', border: 0, outline: 'none',
                        color: T.text, fontSize: 13, padding: '6px 0',
                      }}
                    />
                    <VoiceMicButton value={draft} setValue={setDraft} size={28} title="Speak title" />
                    <button onClick={() => {
                      updatePdpModule(personaKey, { title: draft });
                      setEditing(null);
                    }} style={{
                      background: T.cyan, color: T.void, border: 0,
                      padding: '6px 12px', fontSize: 11, fontWeight: 700,
                      cursor: 'pointer', borderRadius: 4,
                    }}>Save</button>
                    <button onClick={() => setEditing(null)} style={{
                      background: 'transparent', color: T.text3, border: 0,
                      padding: '6px 8px', fontSize: 11, cursor: 'pointer',
                    }}>Cancel</button>
                  </>
                ) : (
                  <>
                    <span style={{ flex: 1, color: T.text, fontSize: 13 }}>{mod.title || <em style={{ color: T.text3 }}>(no title)</em>}</span>
                    <button onClick={() => { setEditing(`pdp-title-${personaKey}`); setDraft(mod.title || ''); }} style={{
                      background: 'rgba(15,23,42,0.05)',
                      border: `1px solid ${T.hairline}`,
                      color: T.text2,
                      padding: '6px 12px', fontSize: 11, cursor: 'pointer', borderRadius: 4,
                      display: 'flex', alignItems: 'center', gap: 6,
                    }}><Edit3 size={11} /> Edit</button>
                  </>
                )}
              </div>

              {/* Product slots — 3 dropdowns. Each slot can be set or cleared. */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                {[0, 1, 2].map(slotIdx => {
                  const currentId = (mod.items || [])[slotIdx];
                  const currentProduct = currentId ? CATALOG.find(p => p.id === currentId || p.sku === currentId) : null;
                  return (
                    <div key={slotIdx} style={{
                      background: T.void,
                      border: `1px dashed ${currentProduct ? T.violet + '66' : T.hairline}`,
                      borderRadius: 6, padding: 10,
                      display: 'flex', flexDirection: 'column', gap: 6,
                      minHeight: 80,
                    }}>
                      <span style={{ fontSize: 10, color: T.text3 }}>SLOT {slotIdx + 1}</span>
                      {currentProduct ? (
                        <>
                          <div style={{ fontSize: 11, color: T.text, lineHeight: 1.3 }}>{currentProduct.name}</div>
                          <div style={{ fontSize: 10, color: T.text3 }}>{currentProduct.sku}</div>
                          <button onClick={() => {
                            const items = [...(mod.items || [])];
                            items[slotIdx] = null;
                            updatePdpModule(personaKey, { items: items.filter(Boolean) });
                          }} style={{
                            background: 'transparent', border: `1px solid ${T.red}44`, color: T.red,
                            padding: '3px 8px', fontSize: 10, cursor: 'pointer', borderRadius: 3,
                            alignSelf: 'flex-start', marginTop: 'auto',
                          }}>Remove</button>
                        </>
                      ) : (
                        <PdpModuleProductPicker
                          excludeIds={(mod.items || []).filter(Boolean)}
                          onPick={(productId) => {
                            const items = [...(mod.items || [])];
                            items[slotIdx] = productId;
                            // Compact so order matches slot order
                            const compacted = [];
                            for (let i = 0; i < 3; i++) if (items[i]) compacted.push(items[i]);
                            updatePdpModule(personaKey, { items: compacted });
                          }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* ---------- ADMIN AI ASSISTANT ---------- */}
      <DisruptionPanel />

      <AdminAssistant
        rules={rules}
        pinnedByCategory={pinnedByCategory}
        pdpOverrides={pdpOverrides}
        onApply={applySuggestion}
        llmEnabled={llmEnabled}
      />
    </div>
  );
};

// Small dropdown picker for filling a PDP module product slot. Lists ALL
// catalog products (across categories) so admin can mix cross-category
// recommendations. Excludes products already in the module.
const PdpModuleProductPicker = ({ excludeIds = [], onPick }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const available = useMemo(() => {
    const exclude = new Set(excludeIds);
    return CATALOG.filter(p => !exclude.has(p.id) && !exclude.has(p.sku))
      .filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase()))
      .slice(0, 40);
  }, [excludeIds, search]);
  if (!open) {
    return (
      <button onClick={() => setOpen(true)} style={{
        background: 'rgba(25,70,200,0.08)',
        border: `1px solid ${T.violet}44`,
        color: T.violet,
        padding: '8px 10px', fontSize: 11, cursor: 'pointer', borderRadius: 4,
        marginTop: 'auto', alignSelf: 'stretch',
      }}>+ Pick product</button>
    );
  }
  return (
    <div style={{ position: 'relative', marginTop: 'auto' }}>
      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search products…"
        autoFocus
        style={{
          width: '100%', background: T.void, border: `1px solid ${T.violet}66`,
          borderRadius: 4, padding: '5px 8px', color: T.text, fontSize: 11, outline: 'none',
        }}
      />
      <div style={{
        position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 2,
        background: T.ink2, border: `1px solid ${T.violet}66`, borderRadius: 4,
        maxHeight: 220, overflowY: 'auto', zIndex: 10,
        boxShadow: '0 8px 20px rgba(15,23,42,0.12)',
      }}>
        {available.length === 0 ? (
          <div style={{ padding: 10, fontSize: 11, color: T.text3 }}>No matches</div>
        ) : available.map(p => (
          <button key={p.id} onClick={() => { onPick(p.id); setOpen(false); setSearch(''); }} style={{
            display: 'block', width: '100%', textAlign: 'left',
            background: 'transparent', border: 0, color: T.text,
            padding: '6px 10px', fontSize: 11, cursor: 'pointer',
            borderBottom: `1px solid ${T.hairline}`,
          }}>
            <div style={{ fontWeight: 500 }}>{p.name}</div>
            <div style={{ fontSize: 9, color: T.text3 }}>{p.sku} · {p.category}</div>
          </button>
        ))}
      </div>
      <button onClick={() => { setOpen(false); setSearch(''); }} style={{
        position: 'absolute', top: 0, right: -22, background: 'transparent', border: 0,
        color: T.text3, fontSize: 14, cursor: 'pointer', padding: 0, lineHeight: 1,
      }}>×</button>
    </div>
  );
};

// Small per-category dropdown that lets the merchandiser pin a product manually
// without going through the AI. Lists only products in that category that aren't already pinned.
const CategoryPinAdder = ({ category, currentPins, onPin }) => {
  const [open, setOpen] = useState(false);
  const available = useMemo(() =>
    CATALOG.filter(p => p.category === category && !currentPins.includes(p.sku)),
  [category, currentPins]);
  if (available.length === 0) return (
    <span style={{ fontSize: 10, color: T.text3, fontStyle: 'italic' }}>All pinned</span>
  );
  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          background: 'rgba(37,99,235,0.08)',
          border: `1px solid ${T.cyan}44`,
          color: T.cyan,
          padding: '6px 12px', fontSize: 11, cursor: 'pointer',
          borderRadius: 6, fontFamily: T.mono,
          display: 'flex', alignItems: 'center', gap: 6,
        }}>+ ADD PIN</button>
      {open && (
        <div style={{
          position: 'absolute', top: '110%', right: 0, zIndex: 10,
          minWidth: 280, maxHeight: 260, overflowY: 'auto',
          background: T.ink, border: `1px solid ${T.glassBorderHi}`,
          borderRadius: 8, padding: 6,
          boxShadow: `0 12px 36px rgba(15,23,42,0.15)`,
        }}>
          {available.slice(0, 12).map(p => (
            <button
              key={p.id}
              onClick={() => { onPin(p.sku); setOpen(false); }}
              style={{
                width: '100%', textAlign: 'left',
                padding: '8px 10px', background: 'transparent', border: 0,
                color: T.text, fontSize: 12, cursor: 'pointer', borderRadius: 4,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8,
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(15,23,42,0.06)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {p.name}
              </span>
              <span className="mono" style={{ color: T.text3, fontSize: 10, flexShrink: 0 }}>${p.price}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

/* ============================================================================
   ADMIN AI ASSISTANT — always-on AI agent panel inside Merch Tool
   ============================================================================ */
const AdminAssistant = ({ rules, pinnedByCategory, pdpOverrides, onApply, llmEnabled }) => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: llmEnabled
        ? "Hi — I help with merchandising. Ask me to draft banner copy, suggest pinned SKUs for any category, customize the PDP recommendation module for a persona, or reason about strategy. I can read your current state and propose changes you can apply with one click."
        : "AI assistant is off. Connect an AI agent key (panel above) to enable banner drafting, SKU pinning suggestions, and merchandising strategy chat.",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [appliedIdx, setAppliedIdx] = useState(new Set());   // track which suggestions were applied
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  const send = async (text) => {
    if (!text.trim()) return;
    if (loading) return;   // prevent concurrent requests
    if (!llmEnabled) {
      setMessages(m => [
        ...m,
        { role: 'user', text },
        { role: 'assistant', text: "I need an AI agent key to help with this. Use the AI Agent panel above to connect." },
      ]);
      setInput('');
      return;
    }
    const userMsg = { role: 'user', text };
    const history = messages.filter(m => m.role && m.text);
    setMessages(m => [...m, userMsg]);
    setInput('');
    setLoading(true);

    // Build current state snapshot for Claude — includes per-category pinning
    // and per-persona PDP module config so AI can reason about all three
    // levers: banners, pinned SKUs, and personalized PDP recommendations.
    const stateSnapshot = {
      banners: rules?.['home-hero'] || {},
      pinnedByCategory: pinnedByCategory || {},
      pdpModule: rules?.['pdp-module'] || {},
      pdpOverrides: pdpOverrides || {},
    };
    const response = await callLLMForMerch(text, stateSnapshot, history);
    setLoading(false);

    if (!response) {
      setMessages(m => [
        ...m,
        { role: 'assistant', text: 'I had trouble reaching the AI agent. Check the proxy status above.' },
      ]);
      return;
    }
    setMessages(m => [
      ...m,
      { role: 'assistant', text: response.message, suggestions: response.suggestions || [] },
    ]);
  };

  const ADMIN_QUICK_PROMPTS = [
    'Draft urgent hero copy for fitness — emphasize the deal',
    'Suggest 3 SKUs to pin for deer-season weekend',
    'Why are these SKUs pinned right now?',
    'Rewrite the parent hero with a more emotional tone',
  ];

  return (
    <div style={{
      marginTop: 28,
      background: 'linear-gradient(135deg, rgba(37,99,235,0.06) 0%, rgba(25,70,200,0.04) 100%)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      border: `1px solid ${T.cyan}33`,
      borderRadius: 12,
      overflow: 'hidden',
    }}>
      <div style={{
        padding: '16px 22px',
        borderBottom: `1px solid ${T.hairline}`,
        background: `linear-gradient(90deg, ${T.cyan}22 0%, transparent 60%)`,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <strong style={{ fontSize: 14, color: T.text, display: 'flex', alignItems: 'center', gap: 10 }}>
          <Sparkles size={14} color={T.cyan} />
          Merchandising AI Assistant
        </strong>
        <span className="mono" style={{ color: llmEnabled ? T.lime : T.text3, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{
            width: 6, height: 6, borderRadius: '50%',
            background: llmEnabled ? T.lime : T.text3,
            boxShadow: llmEnabled ? `0 0 8px ${T.lime}` : 'none',
          }} />
          {llmEnabled ? 'AI AGENT · READS LIVE STATE' : 'OFFLINE'}
        </span>
      </div>

      <div ref={scrollRef} style={{
        padding: 20,
        maxHeight: 480,
        overflowY: 'auto',
        display: 'flex', flexDirection: 'column', gap: 12,
      }}>
        {messages.map((msg, i) => {
          if (msg.role === 'user') {
            return (
              <div key={i} style={{
                alignSelf: 'flex-end',
                background: T.gradAI, color: 'white',
                padding: '10px 14px',
                borderRadius: '12px 12px 4px 12px',
                maxWidth: '85%',
                fontSize: 13, fontWeight: 500,
                boxShadow: `0 2px 8px ${T.violet}44, inset 0 1px 0 rgba(255,255,255,0.2)`,
              }}>
                {msg.text}
              </div>
            );
          }
          // assistant
          return (
            <div key={i} style={{ alignSelf: 'flex-start', maxWidth: '95%' }}>
              <div style={{
                background: 'rgba(15,23,42,0.05)',
                border: `1px solid ${T.hairline}`,
                padding: '12px 14px',
                borderRadius: '12px 12px 12px 4px',
                fontSize: 13, lineHeight: 1.5, color: T.text,
              }}>
                {msg.text}
              </div>
              {msg.suggestions && msg.suggestions.length > 0 && (
                <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {msg.suggestions.map((s, j) => {
                    const key = `${i}-${j}`;
                    const applied = appliedIdx.has(key);
                    const isInfo = s.kind === 'info';
                    return (
                      <div key={j} style={{
                        background: applied ? 'rgba(22,163,74,0.08)' : 'rgba(15,23,42,0.04)',
                        border: `1px solid ${applied ? T.lime + '44' : T.hairline}`,
                        borderRadius: 8,
                        padding: 12,
                      }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div className="mono" style={{
                              fontSize: 9, marginBottom: 4,
                              color: s.kind === 'banner' ? T.amber
                                   : s.kind === 'pinSkus' ? T.cyan
                                   : s.kind === 'unpinSkus' ? T.pink
                                   : s.kind === 'pdpModule' ? T.violet
                                   : T.text3,
                            }}>
                              {s.kind === 'banner' ? `BANNER · ${s.persona}` :
                               s.kind === 'pinSkus' ? 'PIN SKUS' :
                               s.kind === 'unpinSkus' ? 'UNPIN SKUS' :
                               s.kind === 'pdpModule' ? `PDP MODULE · ${s.persona}` :
                               'INFO'}
                            </div>
                            <div style={{ fontSize: 12, color: T.text, lineHeight: 1.4 }}>
                              {s.kind === 'banner' && <em style={{ color: T.text2 }}>"{s.text}"</em>}
                              {(s.kind === 'pinSkus' || s.kind === 'unpinSkus') && (
                                <span style={{ fontFamily: T.mono, fontSize: 11, color: T.text2 }}>
                                  {(s.skus || []).join(', ')}
                                </span>
                              )}
                              {s.kind === 'pdpModule' && (
                                <span style={{ color: T.text2 }}>
                                  {s.title && <em>"{s.title}"</em>}
                                  {s.title && s.items && s.items.length > 0 && <span style={{ color: T.text3 }}> · </span>}
                                  {s.items && s.items.length > 0 && (
                                    <span style={{ fontFamily: T.mono, fontSize: 11 }}>{s.items.join(', ')}</span>
                                  )}
                                </span>
                              )}
                              {s.kind === 'info' && <span style={{ color: T.text2 }}>{s.label}</span>}
                            </div>
                          </div>
                          {!isInfo && !applied && (
                            <button
                              onClick={async () => {
                                const success = await onApply(s);
                                if (success) setAppliedIdx(prev => new Set([...prev, key]));
                              }}
                              style={{
                                background: T.gradAI, color: 'white',
                                border: 0, padding: '6px 12px', borderRadius: 6,
                                fontSize: 11, fontWeight: 700, cursor: 'pointer',
                                boxShadow: `0 2px 8px ${T.violet}33, inset 0 1px 0 rgba(255,255,255,0.2)`,
                                whiteSpace: 'nowrap',
                              }}
                            >
                              Apply
                            </button>
                          )}
                          {applied && (
                            <span style={{
                              padding: '6px 10px', borderRadius: 6,
                              background: 'rgba(22,163,74,0.15)',
                              color: T.lime, fontSize: 11, fontWeight: 700,
                              display: 'flex', alignItems: 'center', gap: 4,
                            }}>
                              <Check size={11} /> Applied
                            </span>
                          )}
                        </div>
                        {!isInfo && s.label && (
                          <div style={{ fontSize: 10, color: T.text3, marginTop: 6 }}>{s.label}</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
        {loading && (
          <div style={{
            alignSelf: 'flex-start',
            background: 'rgba(37,99,235,0.06)',
            border: `1px solid ${T.cyan}33`,
            padding: '10px 14px',
            borderRadius: '12px 12px 12px 4px',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <Loader2 size={14} className="pulse-soft" color={T.cyan} />
            <span style={{ fontSize: 12, color: T.text2 }}>AI agent is thinking</span>
            <span style={{ display: 'flex', gap: 3 }}>
              <span className="think-dot" style={{ width: 4, height: 4, background: T.cyan, borderRadius: '50%' }} />
              <span className="think-dot" style={{ width: 4, height: 4, background: T.cyan, borderRadius: '50%' }} />
              <span className="think-dot" style={{ width: 4, height: 4, background: T.cyan, borderRadius: '50%' }} />
            </span>
          </div>
        )}

        {messages.length === 1 && !loading && llmEnabled && (
          <div style={{ marginTop: 4 }}>
            <div className="mono" style={{ color: T.text3, fontSize: 9, marginBottom: 8 }}>Try asking</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {ADMIN_QUICK_PROMPTS.map(p => (
                <button
                  key={p}
                  onClick={() => send(p)}
                  style={{
                    background: 'rgba(15,23,42,0.04)',
                    border: `1px solid ${T.hairline}`,
                    color: T.text,
                    padding: '10px 12px', borderRadius: 6,
                    fontSize: 12, textAlign: 'left', cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = T.cyan + '44'; e.currentTarget.style.background = 'rgba(37,99,235,0.05)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = T.hairline; e.currentTarget.style.background = 'rgba(15,23,42,0.04)'; }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <form onSubmit={e => { e.preventDefault(); send(input); }} style={{
        padding: '14px 16px 16px',
        borderTop: `1px solid ${T.hairline}`,
        background: 'rgba(15,23,42,0.035)',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: T.void, border: `1px solid ${T.hairlineStrong}`,
          borderRadius: 8, padding: '4px 6px 4px 14px',
        }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={llmEnabled ? "Ask anything about merchandising…" : "Connect the AI agent to enable…"}
            disabled={!llmEnabled}
            style={{
              flex: 1, background: 'transparent', border: 0, outline: 'none',
              color: T.text, fontSize: 13, padding: '10px 0',
            }}
          />
          {llmEnabled && (
            <VoiceMicButton
              value={input}
              setValue={setInput}
              size={34}
              title="Click to speak your request"
              onAutoSubmit={(text) => {
                // send() guards against concurrent calls via its own `loading`
                // check, so we can call it freely here.
                if (text?.trim()) send(text);
              }}
            />
          )}
          <button type="submit" disabled={!input.trim() || !llmEnabled} style={{
            background: (input.trim() && llmEnabled) ? T.gradAI : 'rgba(15,23,42,0.06)',
            border: 0,
            color: (input.trim() && llmEnabled) ? 'white' : T.text3,
            width: 30, height: 30, borderRadius: 6,
            cursor: (input.trim() && llmEnabled) ? 'pointer' : 'not-allowed',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: (input.trim() && llmEnabled) ? `0 2px 8px ${T.violet}33` : 'none',
            transition: 'all 0.2s',
          }}>
            <ArrowRight size={13} strokeWidth={2.5} />
          </button>
        </div>
      </form>
    </div>
  );
};

/* ============================================================================
   CART (minimal — for demo flow continuity)
   ============================================================================ */
const CartPage = () => {
  const { cart, setView, shouldCheckout, clearCart, markConverted, cartDiscounts, agentKey, agentEnabled, applyCartDiscount, adapterId, refreshShopifyOrders, removeFromCart } = useApp();
  const [placed, setPlaced] = useState(false);
  // Snapshot the cart at the moment of placement so the confirmation page
  // can still show "you bought X items" even after we clear the live cart.
  const [placedSnapshot, setPlacedSnapshot] = useState(null);

  // Apply any agent-granted discounts (from accepted email offers) per line.
  const lineNet = (i) => i.product.price * i.qty * (1 - (cartDiscounts?.[i.product?.id] || 0));
  const subtotal = cart.reduce((s, i) => s + i.product.price * i.qty, 0);
  const total = cart.reduce((s, i) => s + lineNet(i), 0);
  const discountTotal = subtotal - total;

  // Discount feels instant: on landing (e.g. returning from the email accept
  // page), immediately read the agent's KV state and apply any already-accepted
  // offer, rather than waiting for the lifecycle agent's next 15s poll.
  useEffect(() => {
    if (!agentEnabled || !agentKey) return;
    let cancelled = false;
    (async () => {
      try {
        const remote = await agentReadState(agentKey);
        if (cancelled || !remote?.items) return;
        for (const [id, st] of Object.entries(remote.items)) {
          if (st?.acceptedAt && typeof applyCartDiscount === 'function') applyCartDiscount(id, 0.10);
        }
      } catch {}
    })();
    return () => { cancelled = true; };
  }, [agentKey, agentEnabled, applyCartDiscount]);

  // Shared placement path used by BOTH the chat-driven auto-checkout effect and
  // the manual PLACE ORDER button. Beyond the local "placed" UI it writes the
  // order back to Shopify (real order on the dev store, attached to the persona's
  // customer record by email) so order history + inventory update — the
  // two-way feedback loop that drives personalization on the next interaction.
  // Best-effort: if the Shopify write fails (missing scope, network, etc.) we
  // still show the order placed locally so the demo never visibly breaks.
  const commitPlacement = useCallback(() => {
    const items = cart.length;
    const placedTotal = total;
    setPlacedSnapshot({ items, total: placedTotal });
    setPlaced(true);
    if (typeof markConverted === 'function') markConverted();

    if (adapterId === 'shopify' && agentKey && cart.length > 0) {
      const lineItems = cart
        .map(i => ({ variantId: i.product?.shopifyVariantId, quantity: i.qty }))
        .filter(li => !!li.variantId);
      if (lineItems.length > 0) {
        placeShopifyOrder({
          customerEmail: agentKey,
          lineItems,
          note: `TechDay demo · in-app order · $${placedTotal.toFixed(2)}`,
        }).then(r => {
          if (r?.success) {
            // Pull fresh order history so chat + Orders page see the new order.
            // Indexing delay: retry once after a beat to catch the late index.
            if (typeof refreshShopifyOrders === 'function') {
              refreshShopifyOrders();
              setTimeout(() => refreshShopifyOrders?.(), 2500);
            }
          } else {
            console.warn('Shopify order write-back failed:', r?.error, r?.details);
          }
        });
      }
    }

    clearCart();
  }, [cart, total, markConverted, clearCart, adapterId, agentKey, refreshShopifyOrders]);

  // If chat asked us to checkout and cart isn't empty, auto-place after a beat
  useEffect(() => {
    if (shouldCheckout && cart.length > 0 && !placed) {
      const t = setTimeout(() => { commitPlacement(); }, 900);
      return () => clearTimeout(t);
    }
  }, [shouldCheckout, cart.length, placed, commitPlacement]);

  if (placed) {
    const items = placedSnapshot?.items ?? 0;
    const placedTotal = placedSnapshot?.total ?? 0;
    return (
      <div style={{ maxWidth: 700, margin: '0 auto', padding: '96px 32px 80px', textAlign: 'center' }}>
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 12 }}
          style={{
            width: 80, height: 80, margin: '0 auto 28px',
            borderRadius: '50%',
            background: T.gradHero,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 12px 48px ${T.violet}55, 0 0 80px ${T.pink}33`,
          }}>
          <Check size={36} color="white" strokeWidth={3} />
        </motion.div>
        <h1 className="display" style={{ fontSize: 48, margin: '0 0 16px', color: T.text }}>Order Placed</h1>
        <p style={{ fontSize: 16, color: T.text2, maxWidth: 480, margin: '0 auto 32px' }}>
          {items} item{items !== 1 ? 's' : ''} · ${placedTotal.toFixed(2)} — confirmation sent. Ships in 2-3 business days.
        </p>
        <div className="mono" style={{ color: T.cyan, marginBottom: 24 }}>Order #ASO-{Math.random().toString(36).slice(2, 10).toUpperCase()}</div>
        <button onClick={() => { setView('home'); setPlaced(false); setPlacedSnapshot(null); }} style={{
          background: 'transparent',
          border: `1px solid ${T.glassBorderHi}`,
          color: T.text,
          padding: '14px 24px',
          borderRadius: 999, cursor: 'pointer',
          fontSize: 13, fontWeight: 600, letterSpacing: 0.5,
        }}>Continue Shopping</button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '56px 32px 80px' }}>
      <h1 className="display" style={{ fontSize: 56, margin: '0 0 28px', color: T.text }}>Cart</h1>
      {cart.length === 0 ? (
        <div style={{
          padding: 60, textAlign: 'center',
          background: T.glassSurface,
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: `1px solid ${T.glassBorder}`,
          borderRadius: 12, color: T.text2,
        }}>
          Cart is empty.{' '}
          <button onClick={() => setView('home')} style={{
            background: 'none', border: 0,
            color: T.violet, cursor: 'pointer',
            textDecoration: 'underline', fontSize: 'inherit',
          }}>Continue shopping →</button>
        </div>
      ) : (
        <>
          {cart.map((item, i) => (
            <div key={i} style={{
              display: 'grid', gridTemplateColumns: '80px 1fr auto auto', gap: 18,
              padding: 18,
              background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: `1px solid ${T.glassBorder}`,
              marginBottom: 10,
              borderRadius: 12,
              alignItems: 'center',
            }}>
              <div style={{ width: 80, height: 80, overflow: 'hidden', borderRadius: 6, border: `1px solid ${T.hairline}` }}>
                <ProductIllustration product={item.product} size="thumb" />
              </div>
              <div>
                <div className="mono" style={{ color: T.amber, marginBottom: 4 }}>{item.product.brand} · Qty {item.qty}</div>
                <div style={{ fontWeight: 600, fontSize: 15, color: T.text }}>{item.product.name}</div>
              </div>
              <div style={{ fontWeight: 700, fontSize: 16, color: T.text }}>${(item.product.price * item.qty).toFixed(2)}</div>
              {/* Per-line remove — subtle by default, red on hover to signal destructive action. */}
              <button
                onClick={() => removeFromCart(item.product.id)}
                aria-label={`Remove ${item.product.name} from cart`}
                title="Remove from cart"
                style={{
                  width: 36, height: 36, padding: 0,
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  background: 'transparent',
                  color: T.text3,
                  border: `1px solid ${T.hairline}`,
                  borderRadius: 999,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.color = T.red;
                  e.currentTarget.style.borderColor = `${T.red}55`;
                  e.currentTarget.style.background = `${T.red}11`;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.color = T.text3;
                  e.currentTarget.style.borderColor = T.hairline;
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <X size={16} strokeWidth={2.5} />
              </button>
            </div>
          ))}
          <div style={{
            marginTop: 24, padding: 22,
            background: 'linear-gradient(135deg, rgba(25,70,200,0.10) 0%, rgba(200,16,46,0.06) 100%)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: `1px solid ${T.violet}44`,
            color: T.text,
            borderRadius: 12,
            boxShadow: `0 8px 32px ${T.violet}22`,
          }}>
            {discountTotal > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, color: T.lime, fontSize: 13, fontFamily: T.mono }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Tag size={13} /> Agent offer applied (10% off)</span>
                <span>− ${discountTotal.toFixed(2)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="mono" style={{ color: T.violet }}>{discountTotal > 0 ? 'Total' : 'Subtotal'}</span>
              <span style={{ fontSize: 24, fontWeight: 700, color: T.text }}>${total.toFixed(2)}</span>
            </div>
          </div>
          <button
            onClick={() => commitPlacement()}
            style={{
              marginTop: 18, width: '100%',
              background: T.gradHero, color: 'white',
              border: 0, padding: '20px 28px',
              fontSize: 15, fontWeight: 700,
              cursor: 'pointer', letterSpacing: 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              borderRadius: 999,
              boxShadow: `0 8px 32px ${T.violet}55, 0 0 60px ${T.pink}33, inset 0 1px 0 rgba(255,255,255,0.25)`,
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 12px 48px ${T.violet}77, 0 0 80px ${T.pink}55, inset 0 1px 0 rgba(255,255,255,0.3)`; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = `0 8px 32px ${T.violet}55, 0 0 60px ${T.pink}33, inset 0 1px 0 rgba(255,255,255,0.25)`; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            PLACE ORDER — ${total.toFixed(2)} <ArrowRight size={16} />
          </button>
        </>
      )}
    </div>
  );
};

/* ============================================================================
   ROOT APP
   ============================================================================ */
// =============================================================================
//   AUTH — demo-only credentials, persisted in localStorage so refresh works.
//   In production this would be a real auth flow (Cognito, Auth0, Shopify
//   Customer Accounts, etc.) — the demo just mocks identity to drive personas.
// =============================================================================
// Credential map. Each customer's password is their own name (lowercased).
// Admin uses "admin" / "admin". Keys are case-insensitive on login.
const DEMO_USERS = {
  jake:  { username: 'jake',  password: 'jake',  role: 'customer', persona: 'hunter',  displayName: 'Jake'  },
  maria: { username: 'maria', password: 'maria', role: 'customer', persona: 'parent',  displayName: 'Maria' },
  alex:  { username: 'alex',  password: 'alex',  role: 'customer', persona: 'fitness', displayName: 'Alex'  },
  admin: { username: 'admin', password: 'admin', role: 'admin',    persona: 'hunter',  displayName: 'Admin' },
};

const AUTH_STORAGE_KEY = 'aso-demo-auth';

// Auth state model:
//   null            → app not yet rendered (initial mount only)
//   ANON_USER       → anonymous browser; can shop, can't access admin
//   DEMO_USERS[id]  → authenticated user; persona drives personalization
const ANON_USER = {
  username: null,
  role: 'anonymous',
  persona: null,                        // no persona = no personalization signal
  displayName: 'Guest',
};

const loadStoredUser = () => {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed?.anonymous) return ANON_USER;
    if (parsed?.dynamic && parsed.user) return parsed.user;   // self-signup user
    // Validate against the user map in case storage is stale or corrupted
    const user = DEMO_USERS[parsed?.username];
    return user || null;
  } catch (e) { return null; }
};

const storeUser = (user) => {
  try {
    if (!user) {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } else if (user.role === 'anonymous') {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ anonymous: true }));
    } else if (user.dynamic) {
      // Self-signup user — persist the whole object (not in DEMO_USERS).
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ dynamic: true, user }));
    } else {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ username: user.username }));
    }
  } catch (e) { /* private browsing — ignore */ }
};

// Self-signup customer profile (Shopify customer record + chosen interest type),
// persisted separately so a reload keeps the visitor "signed in" as themselves.
const DYNAMIC_CUSTOMER_KEY = 'aso-demo-dynamic-customer';
const loadDynamicCustomer = () => {
  try {
    const raw = localStorage.getItem(DYNAMIC_CUSTOMER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
};
const storeDynamicCustomer = (dc) => {
  try {
    if (dc) localStorage.setItem(DYNAMIC_CUSTOMER_KEY, JSON.stringify(dc));
    else localStorage.removeItem(DYNAMIC_CUSTOMER_KEY);
  } catch { /* ignore */ }
};

// =============================================================================
//   LOGIN PAGE — shown when user is null. Includes one-click prefill buttons
//   so a presenter can hop between personas fast on stage.
// =============================================================================
const LoginPage = () => {
  const { login, continueAsGuest, setAuthView } = useApp();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const submit = (e) => {
    e?.preventDefault?.();
    setError(null);
    const result = login(username, password);
    if (!result.ok) setError(result.error);
  };

  // Quick-fill a credential then submit on next paint
  const useCredential = (u) => {
    setUsername(u.username);
    setPassword(u.password);
    setError(null);
    // Submit via a microtask so React state has flushed
    setTimeout(() => {
      const result = login(u.username, u.password);
      if (!result.ok) setError(result.error);
    }, 30);
  };

  // The 4 selectable cards on the login screen
  const cards = [
    { user: DEMO_USERS.jake,  icon: '🦌', subtitle: 'Hunter · Texas',          accent: '#c5523e' },
    { user: DEMO_USERS.maria, icon: '⚽', subtitle: 'Parent · Two kids',       accent: '#1e6f5c' },
    { user: DEMO_USERS.alex,  icon: '🏃', subtitle: 'Fitness · Deal-led',      accent: '#2563eb' },
    { user: DEMO_USERS.admin, icon: '⚙️', subtitle: 'Admin · Merchandiser',   accent: '#1946c8' },
  ];

  return (
    <div className="aso-root" style={{
      minHeight: '100vh',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '40px 24px',
      background: `radial-gradient(ellipse at top, ${T.ink2} 0%, ${T.void} 70%)`,
    }}>
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, justifyContent: 'center' }}>
          <span className="display" style={{ fontSize: 44, fontStyle: 'italic', color: T.text }}>Academy</span>
          <span className="mono" style={{ color: T.amber, fontSize: 14 }}>Sports + Outdoors</span>
        </div>
        <p style={{ color: T.text2, fontSize: 14, marginTop: 12 }}>
          Sign in to see your personalized experience.
        </p>
      </div>

      {/* Quick-fill persona cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: 16,
        width: '100%', maxWidth: 760,
        marginBottom: 32,
      }}>
        {cards.map(c => (
          <button
            key={c.user.username}
            onClick={() => useCredential(c.user)}
            style={{
              padding: '20px 18px',
              background: `linear-gradient(135deg, ${c.accent}18 0%, rgba(255,255,255,0.02) 100%)`,
              border: `1px solid ${c.accent}44`,
              borderRadius: 12,
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.2s',
              color: T.text,
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = `0 12px 32px ${c.accent}33`;
              e.currentTarget.style.borderColor = `${c.accent}88`;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.borderColor = `${c.accent}44`;
            }}
          >
            <div style={{ fontSize: 32, marginBottom: 8 }}>{c.icon}</div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>{c.user.displayName}</div>
            <div className="mono" style={{ color: T.text3, fontSize: 11, marginTop: 4 }}>{c.subtitle}</div>
            <div className="mono" style={{ color: c.accent, fontSize: 10, marginTop: 12, opacity: 0.8 }}>
              ▸ {c.user.username} / {c.user.password}
            </div>
          </button>
        ))}
      </div>

      {/* Manual login form */}
      <form onSubmit={submit} style={{
        width: '100%', maxWidth: 380,
        padding: 28,
        background: T.glassSurface,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: `1px solid ${T.glassBorder}`,
        borderRadius: 12,
      }}>
        <div className="mono" style={{ color: T.text3, fontSize: 11, marginBottom: 16, textAlign: 'center' }}>
          OR SIGN IN MANUALLY
        </div>
        <input
          type="text"
          placeholder="Username"
          value={username}
          autoComplete="username"
          onChange={e => setUsername(e.target.value)}
          style={{
            width: '100%', padding: '12px 14px', marginBottom: 10,
            background: T.void, border: `1px solid ${T.hairlineStrong}`,
            color: T.text, borderRadius: 6, fontSize: 14,
            boxSizing: 'border-box',
          }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          autoComplete="current-password"
          onChange={e => setPassword(e.target.value)}
          style={{
            width: '100%', padding: '12px 14px', marginBottom: 16,
            background: T.void, border: `1px solid ${T.hairlineStrong}`,
            color: T.text, borderRadius: 6, fontSize: 14,
            boxSizing: 'border-box',
          }}
        />
        {error && (
          <div style={{ color: T.red, fontSize: 12, marginBottom: 12, textAlign: 'center' }}>
            {error}
          </div>
        )}
        <button
          type="submit"
          style={{
            width: '100%', padding: '12px 16px',
            background: T.gradHero, color: 'white',
            border: 0, fontSize: 13, fontWeight: 700, letterSpacing: 1,
            cursor: 'pointer', borderRadius: 999,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            boxShadow: `0 6px 24px ${T.violet}44`,
          }}
        >
          SIGN IN <ArrowRight size={14} />
        </button>
      </form>

      {/* Anonymous / guest path — equally important first-class option. Most
          real ecommerce traffic is anonymous, so this matches production reality. */}
      <div style={{
        width: '100%', maxWidth: 380,
        marginTop: 16,
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <div style={{ flex: 1, height: 1, background: T.hairline }} />
        <span className="mono" style={{ color: T.text3, fontSize: 10 }}>OR</span>
        <div style={{ flex: 1, height: 1, background: T.hairline }} />
      </div>
      <button
        onClick={continueAsGuest}
        style={{
          width: '100%', maxWidth: 380,
          marginTop: 16,
          padding: '12px 16px',
          background: 'transparent',
          color: T.text2,
          border: `1px solid ${T.hairlineStrong}`,
          fontSize: 13, fontWeight: 600,
          cursor: 'pointer', borderRadius: 999,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          transition: 'all 0.2s',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = 'rgba(15,23,42,0.05)';
          e.currentTarget.style.borderColor = T.glassBorderHi;
          e.currentTarget.style.color = T.text;
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.borderColor = T.hairlineStrong;
          e.currentTarget.style.color = T.text2;
        }}
      >
        Continue as guest →
      </button>
      <button
        onClick={() => setAuthView('signup')}
        style={{
          width: '100%', maxWidth: 380, marginTop: 12,
          padding: '13px 16px',
          background: 'transparent',
          color: T.violet,
          border: `1.5px solid ${T.violet}`,
          fontSize: 13, fontWeight: 700, letterSpacing: 0.5,
          cursor: 'pointer', borderRadius: 999,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          transition: 'all 0.2s',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = T.violet; e.currentTarget.style.color = 'white'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = T.violet; }}
      >
        Create an account →
      </button>
      <div style={{ color: T.text3, fontSize: 11, marginTop: 10, textAlign: 'center', maxWidth: 380 }}>
        Browse without signing in. No personalization until you sign in or create an account.
      </div>

      <div className="mono" style={{ color: T.text3, fontSize: 11, marginTop: 32, textAlign: 'center', maxWidth: 500 }}>
        Demo accounts · Click a card above to auto-fill and sign in.
      </div>
    </div>
  );
};

// =============================================================================
//   SIGNUP PAGE — real-time account creation. Submits to the Worker, which
//   creates a real Shopify customer via the Admin API. On success the visitor
//   is signed in as themselves; their chosen interest seeds personalization,
//   and any order they place writes back to their own Shopify record.
// =============================================================================
const INTERESTS = [
  { id: 'hunting', icon: '🦌', label: 'Hunting & Outdoors', sub: 'Scopes, blinds, camo, optics' },
  { id: 'team',    icon: '⚽', label: 'Team Sports & Family', sub: 'Cleats, balls, youth gear' },
  { id: 'fitness', icon: '🏃', label: 'Fitness & Training',  sub: 'Apparel, weights, recovery' },
];

const SignupPage = () => {
  const { signUp, setAuthView } = useApp();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [zip, setZip] = useState('');
  const [interest, setInterest] = useState('hunting');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const inputStyle = {
    width: '100%', padding: '12px 14px',
    background: T.void, border: `1px solid ${T.hairlineStrong}`,
    color: T.text, borderRadius: 8, fontSize: 14,
    boxSizing: 'border-box',
  };

  const submit = async (e) => {
    e?.preventDefault?.();
    setError(null);
    if (!email.trim() || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) {
      setError('Please enter a valid email address.'); return;
    }
    if (!firstName.trim()) { setError('Please enter your first name.'); return; }
    setBusy(true);
    const res = await signUp({ firstName: firstName.trim(), lastName: lastName.trim(), email: email.trim(), zip: zip.trim(), interest });
    setBusy(false);
    if (!res.ok) setError(res.error || 'Something went wrong creating your account.');
    // On success the gate unmounts (user is now set) — nothing else to do here.
  };

  return (
    <div className="aso-root" style={{
      minHeight: '100vh',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '40px 24px',
      background: `radial-gradient(ellipse at top, ${T.ink2} 0%, ${T.void} 70%)`,
    }}>
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, justifyContent: 'center' }}>
          <span className="display" style={{ fontSize: 40, fontStyle: 'italic', color: T.text }}>Academy</span>
          <span className="mono" style={{ color: T.amber, fontSize: 13 }}>Sports + Outdoors</span>
        </div>
        <p style={{ color: T.text2, fontSize: 14, marginTop: 10 }}>
          Create your account — we'll personalize the store to you from the first click.
        </p>
      </div>

      <form onSubmit={submit} style={{
        width: '100%', maxWidth: 440,
        padding: 28,
        background: T.glassSurface,
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        border: `1px solid ${T.glassBorder}`, borderRadius: 14,
      }}>
        <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
          <input style={inputStyle} placeholder="First name" value={firstName} autoComplete="given-name" onChange={e => setFirstName(e.target.value)} />
          <input style={inputStyle} placeholder="Last name" value={lastName} autoComplete="family-name" onChange={e => setLastName(e.target.value)} />
        </div>
        <input style={{ ...inputStyle, marginBottom: 10 }} type="email" placeholder="Email address" value={email} autoComplete="email" onChange={e => setEmail(e.target.value)} />
        <input style={{ ...inputStyle, marginBottom: 18 }} placeholder="ZIP code (for your nearest store)" value={zip} inputMode="numeric" autoComplete="postal-code" onChange={e => setZip(e.target.value)} />

        <div className="mono" style={{ color: T.text3, fontSize: 11, marginBottom: 10 }}>WHAT ARE YOU SHOPPING FOR?</div>
        <div style={{ display: 'grid', gap: 8, marginBottom: 20 }}>
          {INTERESTS.map(it => {
            const active = interest === it.id;
            return (
              <button
                type="button"
                key={it.id}
                onClick={() => setInterest(it.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 14px', textAlign: 'left',
                  background: active ? `${T.violet}12` : 'transparent',
                  border: `1.5px solid ${active ? T.violet : T.hairlineStrong}`,
                  borderRadius: 10, cursor: 'pointer', color: T.text,
                  transition: 'all 0.15s',
                }}
              >
                <span style={{ fontSize: 24 }}>{it.icon}</span>
                <span style={{ flex: 1 }}>
                  <span style={{ display: 'block', fontWeight: 700, fontSize: 14 }}>{it.label}</span>
                  <span className="mono" style={{ color: T.text3, fontSize: 10 }}>{it.sub}</span>
                </span>
                {active && <Check size={18} color={T.violet} strokeWidth={3} />}
              </button>
            );
          })}
        </div>

        {error && (
          <div style={{ color: T.red, fontSize: 12, marginBottom: 12, textAlign: 'center' }}>{error}</div>
        )}

        <button
          type="submit"
          disabled={busy}
          style={{
            width: '100%', padding: '14px 16px',
            background: busy ? T.text3 : T.gradHero, color: 'white',
            border: 0, fontSize: 13, fontWeight: 700, letterSpacing: 1,
            cursor: busy ? 'wait' : 'pointer', borderRadius: 999,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            boxShadow: busy ? 'none' : `0 6px 24px ${T.violet}44`,
          }}
        >
          {busy
            ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> Creating your account…</>
            : <>CREATE ACCOUNT <ArrowRight size={14} /></>}
        </button>

        <div className="mono" style={{ color: T.text3, fontSize: 10, marginTop: 14, textAlign: 'center', lineHeight: 1.5 }}>
          Creates a real customer on the Shopify store. No password needed for the demo.
        </div>
      </form>

      <button
        onClick={() => setAuthView('login')}
        style={{
          marginTop: 18, background: 'transparent', border: 0,
          color: T.text2, fontSize: 13, cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 6,
        }}
      >
        ← Back to sign in
      </button>
    </div>
  );
};

// Shown to customer accounts that try to navigate to Merch Tool
const AccessDenied = () => {
  const { user, setView } = useApp();
  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '96px 32px', textAlign: 'center' }}>
      <div style={{
        width: 64, height: 64, margin: '0 auto 24px',
        borderRadius: '50%', background: `${T.red}22`,
        border: `1px solid ${T.red}55`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <X size={28} color={T.red} />
      </div>
      <h1 className="display" style={{ fontSize: 40, marginBottom: 16, color: T.text }}>Admin only</h1>
      <p style={{ color: T.text2, fontSize: 15, marginBottom: 24 }}>
        The Merch Tool is restricted to administrators. You're signed in as <strong style={{ color: T.text }}>{user.displayName}</strong>.
      </p>
      <button
        onClick={() => setView('home')}
        style={{
          background: T.gradHero, color: 'white', border: 0,
          padding: '12px 22px', fontSize: 13, fontWeight: 600, letterSpacing: 0.5,
          cursor: 'pointer', borderRadius: 999,
          boxShadow: `0 6px 24px ${T.violet}44`,
        }}
      >
        Back to home
      </button>
    </div>
  );
};

/* ============================================================================
   LIFECYCLE AGENT (browser) — the autonomous, always-watching agent.
   Polls on an interval; detects abandoned-cart items and escalates:
     stage1 (highlights + reviews) → stage2 (time-boxed discount w/ accept link)
   Detects conversion (checkout) and email-link acceptance (via KV), and
   changes behavior: stops escalating, applies the discount in-app.
   Syncs state to the Worker KV so the cron agent can carry on after tab close.
   Runs silently (no shopper-visible UI); admin controls timing via fastForward.
   ============================================================================ */
// Base (realistic) escalation thresholds in ms. fastForward divides these.
const AGENT_STAGE1_MS = 30 * 60 * 1000;   // 30 min → highlights email
const AGENT_STAGE2_MS = 2 * 60 * 60 * 1000; // 2 hr → discount email
const AGENT_POLL_MS = 5000;                // poll cadence

function useLifecycleAgent({ enabled, agentKey, cart, persona, profile, orders, converted, fastForward, onApplyDiscount }) {
  // Per-item escalation state lives in a ref (no re-render churn from the loop).
  const stateRef = useRef({});   // { [productId]: { addedAt, stage, lastEmailAt } }
  const acceptedRef = useRef({}); // { [productId]: true } once accepted via link
  const lastSyncRef = useRef(0);
  const lastSyncSigRef = useRef(null); // signature of the last cart we WROTE to KV
  const lastReadRef = useRef(0);       // last time we READ KV for discount acceptance

  useEffect(() => {
    if (!enabled || !agentKey) return;
    let cancelled = false;
    const ff = Math.max(1, fastForward || 1);
    const stage1 = AGENT_STAGE1_MS / ff;
    const stage2 = AGENT_STAGE2_MS / ff;

    const tick = async () => {
      if (cancelled) return;
      const now = Date.now();
      const lines = cart || [];

      // Conversion: cart emptied after having items, or explicit converted flag.
      if (converted) {
        // Mark all tracked items converted; sync; stop escalating.
        Object.keys(stateRef.current).forEach(id => { stateRef.current[id].stage = 'converted'; });
        await agentSyncState({ key: agentKey, cart: [], converted: true, lastPurchaseAt: now });
        return;
      }

      // READ poll (cheap — KV reads are ~10M/day) every 15s to detect
      // email-link discount acceptance and apply it in-app.
      if (now - lastReadRef.current > 15000) {
        lastReadRef.current = now;
        const remote = await agentReadState(agentKey);
        if (remote?.items) {
          for (const [id, st] of Object.entries(remote.items)) {
            if (st.acceptedAt && !acceptedRef.current[id]) {
              acceptedRef.current[id] = true;
              if (typeof onApplyDiscount === 'function') onApplyDiscount(id, 0.10);
            }
          }
        }
      }

      // WRITE to KV only when the cart actually CHANGED since our last write.
      // KV free tier allows just 1,000 writes/day; a fixed 15s write cadence
      // exhausts that in ~4 hours of open tabs (and most writes were redundant
      // empty/unchanged snapshots). Writing on-change cuts writes by >95% —
      // typically just a handful per shopping session. A slow heartbeat keeps a
      // lingering non-empty cart's entry fresh so the cron always sees it.
      const sig = JSON.stringify(lines.map(l => [l.product?.id, l.qty]));
      const sigChanged = sig !== lastSyncSigRef.current;
      const heartbeatDue = lines.length > 0 && (now - lastSyncRef.current > 300000); // 5 min
      if (sigChanged || heartbeatDue) {
        lastSyncRef.current = now;
        lastSyncSigRef.current = sig;
        agentSyncState({
          key: agentKey,
          cart: lines.map(l => ({ id: l.product?.id, title: l.product?.name, price: l.product?.price, addedAt: l.addedAt || now })),
          converted: false,
        });
      }

      // Escalation per cart line.
      for (const line of lines) {
        const id = line.product?.id;
        if (!id) continue;
        const addedAt = line.addedAt || now;
        const age = now - addedAt;
        const st = stateRef.current[id] || (stateRef.current[id] = { addedAt, stage: 'none', lastEmailAt: 0 });
        if (acceptedRef.current[id] || st.stage === 'converted' || st.stage === 'stage2') continue;

        const recipient = profile?.email || PERSONAS[persona]?.shopify?.email;
        if (!recipient) continue;

        // Stage 2: discount email with accept link.
        if (age >= stage2 && st.stage === 'stage1') {
          const acceptLink = agentAcceptUrl(agentKey, id);
          const email = await draftAbandonEmail({ stage: 2, persona, profile, item: line.product, orders, acceptLink });
          const res = await sendEmail({ to: recipient, subject: email.subject, html: email.html, text: email.text });
          if (res.success) { st.stage = 'stage2'; st.lastEmailAt = now; }
        // Stage 1: highlights + reviews.
        } else if (age >= stage1 && st.stage === 'none') {
          const email = await draftAbandonEmail({ stage: 1, persona, profile, item: line.product, orders });
          const res = await sendEmail({ to: recipient, subject: email.subject, html: email.html, text: email.text });
          if (res.success) { st.stage = 'stage1'; st.lastEmailAt = now; }
        }
      }
    };

    const iv = setInterval(tick, AGENT_POLL_MS);
    tick();
    return () => { cancelled = true; clearInterval(iv); };
  }, [enabled, agentKey, cart, persona, profile, converted, fastForward, orders, onApplyDiscount]);
}

// Draft an abandoned-cart email (stage 1 = highlights/reviews, stage 2 = discount).
async function draftAbandonEmail({ stage, persona, profile, item, orders, acceptLink }) {
  const pName = profile?.firstName || PERSONAS[persona]?.name || 'there';
  const brief = stage === 2
    ? `${pName} left "${item?.name}" ($${item?.price?.toFixed(2)}) in their cart and hasn't checked out. Offer 10% off if they complete in the next 30 minutes. Include this exact call-to-action link as an HTML anchor labelled "Apply my 10% discount": ${acceptLink}. Create gentle urgency.`
    : `${pName} added "${item?.name}" ($${item?.price?.toFixed(2)}) to their cart but hasn't checked out. Write a warm nudge highlighting why it's a great pick — quality, popularity, and 2-3 short, realistic-sounding customer review snippets (invent plausible first-name + star sentiment, keep each under 12 words). No discount yet.`;

  const systemPrompt = `You write a single abandoned-cart email for Academy Sports + Outdoors. Warm, human, concise (under 130 words). Sign off "The Academy Sports + Outdoors Team".
CUSTOMER: ${pName} (persona ${persona}).
TASK: ${brief}
Return ONLY JSON, no fences: { "subject": "...", "text": "...", "html": "<p>...</p>" }${acceptLink ? `\nThe html MUST contain an <a href="${acceptLink}">…</a> anchor.` : ''}`;

  if (!LLM_CONFIG.enabled) {
    // Fallback templates.
    if (stage === 2) {
      return {
        subject: `Your ${item?.name} — 10% off if you finish now`,
        html: `<p>Hi ${pName},</p><p>Your <strong>${item?.name}</strong> is still waiting. Here's <strong>10% off</strong> if you complete your order in the next 30 minutes.</p><p><a href="${acceptLink}">Apply my 10% discount →</a></p><p>— The Academy Sports + Outdoors Team</p>`,
        text: `Hi ${pName}, your ${item?.name} is still in your cart. 10% off if you finish in 30 min: ${acceptLink}`,
      };
    }
    return {
      subject: `Still eyeing the ${item?.name}?`,
      html: `<p>Hi ${pName},</p><p>You left the <strong>${item?.name}</strong> in your cart — one of our top-rated picks. Shoppers love it for quality and value.</p><p>"Exactly what I needed." — Sam ★★★★★<br>"Great value, fast delivery." — Dana ★★★★★</p><p>— The Academy Sports + Outdoors Team</p>`,
      text: `Hi ${pName}, you left the ${item?.name} in your cart — a top-rated pick.`,
    };
  }

  const usingProxy = Boolean(LLM_CONFIG.proxyUrl);
  const url = usingProxy ? LLM_CONFIG.proxyUrl : 'https://api.anthropic.com/v1/messages';
  const headers = usingProxy
    ? { 'Content-Type': 'application/json' }
    : { 'Content-Type': 'application/json', 'x-api-key': LLM_CONFIG.apiKey, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' };
  try {
    const res = await fetch(url, {
      method: 'POST', headers,
      body: JSON.stringify({ model: LLM_CONFIG.model, max_tokens: 700, system: systemPrompt, messages: [{ role: 'user', content: 'Write it now. JSON only.' }] }),
    });
    if (!res.ok) throw new Error('llm http ' + res.status);
    const data = await res.json();
    const txt = (data.content || []).find(b => b.type === 'text')?.text || '';
    const parsed = JSON.parse(txt.replace(/```json|```/g, '').trim());
    // Guarantee the accept link is present in stage-2 html.
    if (stage === 2 && acceptLink && !(parsed.html || '').includes(acceptLink)) {
      parsed.html = (parsed.html || '') + `<p><a href="${acceptLink}">Apply my 10% discount →</a></p>`;
    }
    return parsed;
  } catch {
    // LLM failed — return a safe template (no recursion).
    if (stage === 2) {
      return {
        subject: `Your ${item?.name} — 10% off if you finish now`,
        html: `<p>Hi ${pName},</p><p>Your <strong>${item?.name}</strong> is still waiting. Here's <strong>10% off</strong> if you complete your order in the next 30 minutes.</p><p><a href="${acceptLink}">Apply my 10% discount →</a></p><p>— The Academy Sports + Outdoors Team</p>`,
        text: `Hi ${pName}, your ${item?.name} is still in your cart. 10% off if you finish in 30 min: ${acceptLink}`,
      };
    }
    return {
      subject: `Still eyeing the ${item?.name}?`,
      html: `<p>Hi ${pName},</p><p>You left the <strong>${item?.name}</strong> in your cart — one of our top-rated picks.</p><p>— The Academy Sports + Outdoors Team</p>`,
      text: `Hi ${pName}, you left the ${item?.name} in your cart.`,
    };
  }
}

// Per-persona cart persistence key. Each persona keeps its own cart so switching
// personas (and the email -> accept-page -> return round-trip) doesn't bleed carts.
const cartStorageKey = (p) => `aso_cart_${p || 'guest'}`;

export default function App() {
  // Auth — restored from localStorage so refresh doesn't kick you out mid-demo
  const [user, setUser] = useState(() => loadStoredUser());
  const [persona, setPersona] = useState(() => loadStoredUser()?.persona || 'hunter');
  const [view, setView] = useState('home');
  const [activeProduct, setActiveProduct] = useState(null);
  const [cart, setCart] = useState(() => {
    try {
      const raw = localStorage.getItem(cartStorageKey(loadStoredUser()?.persona || 'hunter'));
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  });
  const [adapterId, setAdapterIdState] = useState('shopify');   // DEMO DEFAULT: live Shopify (was 'mock')
  const [llmEnabled, setLlmEnabled] = useState(LLM_CONFIG.enabled);
  const [pendingFilter, setPendingFilter] = useState(null);   // signals CategoryPage to apply a facet
  const [shouldCheckout, setShouldCheckout] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  // Shopify customer session — populated when a persona is active AND the
  // Shopify adapter is live. Holds the customer access token, profile, and
  // real order history pulled from the Storefront API. Null when on Mock,
  // when guest, or before login resolves. The chat personalization reads
  // shopifyOrders to ground suggestions in the persona's real purchases.
  const [shopifySession, setShopifySession] = useState(null);   // { token, profile }
  const [shopifyOrders, setShopifyOrders] = useState([]);
  const [shopifyLoading, setShopifyLoading] = useState(false);

  // Self-signup customer: a real Shopify customer created at runtime via the
  // Admin API. When set, it OVERRIDES the seeded-persona Shopify session — the
  // session profile + order history come from this record instead of one of the
  // three hardcoded personas. The chosen interest still drives personalization
  // (category sort, hero, chat tone) via `persona`. Persisted across reloads.
  const [dynamicCustomer, setDynamicCustomer] = useState(() => loadDynamicCustomer());
  // Which screen the logged-out gate shows: 'login' or 'signup'.
  const [authView, setAuthView] = useState('login');

  // Lifecycle agent controls. agentFastForward compresses the realistic
  // escalation clock for live demos (1 = real time; 240 = 1 min ≈ 4 hrs).
  // agentConverted flips true when a checkout completes so the agent stops.
  // cartDiscounts: { [productId]: rate } applied when an email offer is accepted.
  const [agentFastForward, setAgentFastForward] = useState(1);
  const [agentConverted, setAgentConverted] = useState(false);
  const [cartDiscounts, setCartDiscounts] = useState({});

  // --- Per-persona cart persistence -----------------------------------------
  // Cart used to be in-memory only, so the email -> accept-page -> return
  // round-trip wiped it. We now persist each persona's cart under its own
  // localStorage key, restore it on load (see the useState initializer above),
  // swap carts when the persona changes, and save on every change.
  // cartOwnerRef tracks which persona the in-state cart belongs to, so a persona
  // switch can never write the wrong cart into the wrong key.
  const cartOwnerRef = useRef(persona);
  useEffect(() => {
    if (cartOwnerRef.current === persona) return;   // mount / no real change
    cartOwnerRef.current = persona;
    let loaded = [];
    try {
      const raw = localStorage.getItem(cartStorageKey(persona));
      loaded = raw ? JSON.parse(raw) : [];
    } catch { loaded = []; }
    setCart(loaded);
  }, [persona]);
  useEffect(() => {
    try { localStorage.setItem(cartStorageKey(cartOwnerRef.current), JSON.stringify(cart)); } catch {}
  }, [cart]);

  // Merchandising overrides — set by the Merch Tool admin, consumed by the
  // storefront. In-memory only (resets on page refresh) so a demo gone wrong
  // resets cleanly without having to clear localStorage.
  //
  // heroOverrides: { [personaKey]: textString } — replaces the default body
  //   text on the homepage hero for that persona.
  // pinnedByCategory: { [categoryId]: [sku, ...] } — products that should
  //   appear first on the category page grid. Order in the array = display order.
  const [heroOverrides, setHeroOverrides] = useState({});
  // PDP overrides: { [personaKey]: { title?: string, items?: [productIds] } }
  // Allows admin to customize the persona-specific PDP module — change its
  // headline, swap the recommended products, or both. Per-persona.
  const [pdpOverrides, setPdpOverrides] = useState({});
  const [pinnedByCategory, setPinnedByCategory] = useState({
    hunting: ['SCOPE-VTX-4-16', 'CROSS-RAV-R26', 'BLIND-AMS-360'],
    'team-sports': [],
    fitness: [],
    camping: [],
    fishing: [],
  });

  // Login: validate credentials, set user, lock persona to the user's persona.
  // Cart contents are PRESERVED across the login so a guest who's been shopping
  // doesn't lose their cart when they authenticate (standard ecommerce UX).
  const login = (username, password) => {
    const u = DEMO_USERS[username?.toLowerCase()?.trim()];
    if (!u) return { ok: false, error: 'Unknown user' };
    if (u.password !== password) return { ok: false, error: 'Wrong password' };
    setUser(u);
    setPersona(u.persona);
    storeUser(u);
    return { ok: true };
  };

  // Continue as anonymous guest — no credentials, no persona, neutral experience.
  // Sets persona to null so the personalization code paths know to skip persona-
  // specific sorts, trays, and banners.
  const continueAsGuest = () => {
    setUser(ANON_USER);
    setPersona(null);
    storeUser(ANON_USER);
  };

  // Self-signup: create a REAL Shopify customer in real time, then sign the
  // visitor in as themselves. The chosen interest maps to one of the three
  // personalization profiles (hunter/parent/fitness) so the whole site curates
  // for them immediately — and any order they place writes back to THEIR Shopify
  // record (by email), growing their history and feeding the next interaction.
  const signUp = async ({ firstName, lastName, email, zip, interest }) => {
    const personaType = ({ hunting: 'hunter', team: 'parent', fitness: 'fitness' })[interest] || 'hunter';
    const res = await createShopifyCustomer({ firstName, lastName, email, zip });
    if (!res.success || !res.customer) {
      return { ok: false, error: res.error || 'Could not create your account' };
    }
    const c = res.customer;
    const profile = {
      customerId: String(c.id || ''),
      email: c.email || email,
      firstName: c.firstName || firstName || '',
      lastName: c.lastName || lastName || '',
      displayName: c.firstName || firstName || 'there',
      address: { zip: c.zip || zip || null, city: c.city || null },
    };
    const dc = { profile, personaType, interest };
    const newUser = {
      username: profile.email,
      role: 'customer',
      persona: personaType,
      displayName: profile.firstName || 'You',
      dynamic: true,
    };
    setDynamicCustomer(dc);
    storeDynamicCustomer(dc);
    setUser(newUser);
    setPersona(personaType);
    storeUser(newUser);
    setView('home');
    return { ok: true, existed: res.existed };
  };

  // Anonymous user wants to upgrade to a real account. Drops them at the login
  // page but PRESERVES their cart — that's standard ecommerce UX. Without this,
  // signing in mid-checkout would empty the cart and break the conversion.
  const goToSignIn = () => {
    setUser(null);
    setView('home');
    storeUser(null);
    // NOTE: cart, activeProduct, pendingFilter all preserved intentionally
  };

  // Logout: clear auth + reset transient state so next user starts fresh.
  // Drops cart since the session is over — different from goToSignIn.
  const logout = () => {
    setUser(null);
    setCart([]);
    setView('home');
    setActiveProduct(null);
    setPendingFilter(null);
    setShopifySession(null);
    setShopifyOrders([]);
    setDynamicCustomer(null);
    storeDynamicCustomer(null);
    setAuthView('login');
    storeUser(null);
  };

  // ---- Shopify persona session -------------------------------------------
  // When the Shopify adapter is live AND a real persona is active, log into
  // the matching Shopify customer (one-click — credentials live in PERSONAS)
  // and pull their real order history. On Mock or guest, clear the session so
  // the storefront falls back to its built-in persona signals.
  useEffect(() => {
    let cancelled = false;
    const shopifyLive = adapterId === 'shopify' && ADAPTERS.shopify?.live;

    // Self-signup customer takes precedence: the session profile + orders come
    // from their real Shopify record (read via Admin), not a seeded persona.
    // No Storefront login — these users have no customer access token.
    if (dynamicCustomer?.profile && shopifyLive) {
      setShopifyLoading(true);
      (async () => {
        try {
          const orders = await fetchAdminCustomerOrders(dynamicCustomer.profile.customerId);
          if (cancelled) return;
          setShopifySession({ token: null, profile: dynamicCustomer.profile, dynamic: true });
          setShopifyOrders(orders || []);
        } catch {
          if (!cancelled) {
            setShopifySession({ token: null, profile: dynamicCustomer.profile, dynamic: true });
            setShopifyOrders([]);
          }
        } finally {
          if (!cancelled) setShopifyLoading(false);
        }
      })();
      return () => { cancelled = true; };
    }

    const personaDef = persona ? PERSONAS[persona] : null;
    const creds = personaDef?.shopify;

    if (!shopifyLive || !creds) {
      setShopifySession(null);
      setShopifyOrders([]);
      return;
    }

    setShopifyLoading(true);
    (async () => {
      try {
        const sf = ADAPTERS.shopify;
        const auth = await sf.customerLogin(creds.email, creds.password);
        if (cancelled) return;
        if (!auth?.success || !auth.token) {
          console.warn('Shopify persona login failed:', auth?.error);
          setShopifySession(null);
          setShopifyOrders([]);
          return;
        }
        const [profile, orders] = await Promise.all([
          sf.getCustomer(auth.token),
          sf.getCustomerOrders(auth.token),
        ]);
        if (cancelled) return;
        setShopifySession({ token: auth.token, profile });
        setShopifyOrders(orders || []);
      } catch (e) {
        if (!cancelled) {
          console.warn('Shopify persona session error:', e);
          setShopifySession(null);
          setShopifyOrders([]);
        }
      } finally {
        if (!cancelled) setShopifyLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [persona, adapterId, dynamicCustomer]);

  // ---- Lifecycle agent wiring -------------------------------------------
  // The agent key is the persona's real email (the inbox we send to + the KV
  // document id). Agent runs only with a live Shopify session (real email on
  // file). Discount acceptance (via email link) applies a cart discount in-app.
  const agentKey = shopifySession?.profile?.email || PERSONAS[persona]?.shopify?.email || null;
  const agentEnabled = adapterId === 'shopify' && Boolean(agentKey);

  const applyCartDiscount = useCallback((productId, rate) => {
    setCartDiscounts(d => (d[productId] === rate ? d : { ...d, [productId]: rate }));
  }, []);

  // Pulls the persona's Shopify order history fresh from the Storefront API.
  // Called after we place a new order so the chat / Orders page see it without
  // a page reload. Note: Shopify can take a few seconds to index a brand-new
  // order, so the very first refresh may not include it; a second refresh or
  // a reload will. Best-effort, swallows errors so it never breaks the UI.
  const refreshShopifyOrders = useCallback(async () => {
    if (adapterId !== 'shopify') return;
    // Self-signup customer: fetch via Admin (no Storefront token).
    if (dynamicCustomer?.profile?.customerId) {
      try {
        const orders = await fetchAdminCustomerOrders(dynamicCustomer.profile.customerId);
        setShopifyOrders(orders || []);
      } catch (e) { console.warn('refreshShopifyOrders (admin) failed:', e); }
      return;
    }
    const token = shopifySession?.token;
    if (!token) return;
    try {
      const sf = ADAPTERS.shopify;
      const orders = await sf.getCustomerOrders(token);
      setShopifyOrders(orders || []);
    } catch (e) {
      console.warn('refreshShopifyOrders failed:', e);
    }
  }, [adapterId, shopifySession?.token, dynamicCustomer]);

  // Reset conversion flag whenever a new item is added (a fresh shopping session).
  useEffect(() => {
    if (cart.length > 0 && agentConverted) setAgentConverted(false);
  }, [cart.length]); // eslint-disable-line

  useLifecycleAgent({
    enabled: agentEnabled,
    agentKey,
    cart,
    persona,
    profile: shopifySession?.profile,
    orders: shopifyOrders,
    converted: agentConverted,
    fastForward: agentFastForward,
    onApplyDiscount: applyCartDiscount,
  });

  const addToCart = (product, qty = 1) => {
    if (!product) return;
    setCart(c => {
      // Dedupe by product ID — if it's already in the cart, increment qty instead
      // of adding a duplicate line. This matches real e-commerce UX.
      const existingIdx = c.findIndex(line => line.product?.id === product.id);
      if (existingIdx >= 0) {
        return c.map((line, i) => i === existingIdx ? { ...line, qty: line.qty + qty } : line);
      }
      // addedAt timestamps the line so the lifecycle agent can detect abandonment.
      return [...c, { product, qty, addedAt: Date.now() }];
    });
  };

  // Clear the entire cart. Called both by chat ("clear my cart") and after checkout completes.
  const clearCart = () => setCart([]);

  // Remove a specific product line from the cart by ID.
  // If the line has qty > 1 and qty option is specified, decrement instead of full remove.
  const removeFromCart = (productId, qty = null) => {
    if (!productId) return;
    setCart(c => {
      if (qty == null) {
        // Full remove of this product line
        return c.filter(line => line.product?.id !== productId);
      }
      // Decrement specified qty, removing line if it would hit zero
      return c
        .map(line => line.product?.id === productId ? { ...line, qty: line.qty - qty } : line)
        .filter(line => line.qty > 0);
    });
  };

  // Runtime LLM key swap — also persists to localStorage so it survives reloads.
  // In proxy mode the key isn't needed client-side, but we still let users paste one
  // for direct-mode dev work. The LLM stays "enabled" as long as EITHER a proxy URL
  // OR an API key is available.
  const setLlmKey = (key) => {
    const clean = key.trim();
    LLM_CONFIG.apiKey = clean;
    LLM_CONFIG.enabled = Boolean(LLM_CONFIG.proxyUrl || clean);
    LLM_CONFIG.source = LLM_CONFIG.proxyUrl ? 'proxy' : (clean ? 'localStorage' : 'none');
    try {
      if (clean) window.localStorage.setItem('aso_anthropic_key', clean);
      else window.localStorage.removeItem('aso_anthropic_key');
    } catch (e) { /* private browsing or storage disabled — ignore */ }
    setLlmEnabled(LLM_CONFIG.enabled);
  };

  // Runtime adapter swap — mutates the module-level `adapter` and bumps state
  // so all components that read it re-fetch via useEffect on `adapterId`.
  // Also invalidates the LLM's catalog cache so it reasons about the new backend.
  const setAdapter = (id) => {
    if (!ADAPTERS[id]) return;
    adapter = ADAPTERS[id];
    invalidateCatalogContext();   // AI features will rebuild prompt with new catalog
    setAdapterIdState(id);
  };

  // ACTION DISPATCHER — executes LLM-returned actions on the storefront.
  // Sequenced with small delays so the user can watch the page change.
  const executeActions = async (actions) => {
    if (!Array.isArray(actions) || actions.length === 0) return;
    for (const action of actions) {
      switch (action.type) {
        case 'navigate':
          if (action.view) setView(action.view);
          break;
        case 'openProduct':
          if (action.id) {
            setActiveProduct(action.id);
            setView('pdp');
          }
          break;
        case 'setPersona':
          // Customers are locked to their authenticated persona. Only admins can
          // preview other personas via the chat. This prevents the AI from
          // accidentally bypassing the auth model.
          if (action.persona && PERSONAS[action.persona] && user?.role === 'admin') {
            setPersona(action.persona);
          }
          break;
        case 'addToCart': {
          if (action.id) {
            const product = await adapter.getProduct(action.id);
            if (product) addToCart(product, action.qty || 1);
          }
          break;
        }
        case 'removeFromCart': {
          if (action.id) {
            removeFromCart(action.id, action.qty || null);
          }
          break;
        }
        case 'clearCart':
          clearCart();
          break;
        case 'applyFilter':
          if (action.facetId && action.value) {
            setView('category');
            setPendingFilter({ facetId: action.facetId, value: action.value, _t: Date.now() });
          }
          break;
        case 'viewCart':
          setView('cart');
          break;
        case 'checkout':
          setView('cart');
          setShouldCheckout(true);
          // Clear the cart after the checkout animation runs so the user sees
          // their items confirmed, then a clean post-purchase state.
          setTimeout(() => {
            setShouldCheckout(false);
            clearCart();
          }, 4000);
          break;
        // showResults is handled inline by ChatWidget (it renders the cards in chat)
        default:
          break;
      }
      // small pause between actions so transitions are visible
      await new Promise(r => setTimeout(r, 250));
    }
  };

  const value = {
    user, login, logout, continueAsGuest, goToSignIn,
    signUp, authView, setAuthView, dynamicCustomer,
    persona, setPersona, view, setView, activeProduct, setActiveProduct,
    cart, addToCart, clearCart, removeFromCart, adapterId, setAdapter,
    llmEnabled, setLlmKey,
    executeActions, pendingFilter, setPendingFilter,
    shouldCheckout,
    chatOpen, setChatOpen,
    // Merch overrides (lifted up so HomePage and CategoryPage can read them)
    heroOverrides, setHeroOverrides,
    pdpOverrides, setPdpOverrides,
    pinnedByCategory, setPinnedByCategory,
    // Shopify customer session (live order history for the active persona)
    shopifySession, shopifyOrders, shopifyLoading,
    // Lifecycle agent
    agentFastForward, setAgentFastForward,
    cartDiscounts,
    agentKey, agentEnabled, applyCartDiscount,
    markConverted: () => setAgentConverted(true),
    // Closes the loop: lets CartPage write back to Shopify on order placement
    // and refresh the persona's order history afterwards.
    refreshShopifyOrders,
  };

  const adapterDesc = ADAPTER_DESCRIBE[adapterId];

  return (
    <AppCtx.Provider value={value}>
      <GlobalStyle />
      {!user ? (
        authView === 'signup' ? <SignupPage /> : <LoginPage />
      ) : (
        <div className="aso-root" style={{
          // When chat is docked on the right, shift content left so the page stays visible
          paddingRight: chatOpen ? 'min(460px, calc(100vw - 48px))' : 0,
          transition: 'padding-right 0.35s cubic-bezier(0.2, 0.8, 0.2, 1)',
        }}>
          <TopBar />
          <AnimatePresence mode="wait">
            <motion.div
              key={view + '|' + adapterId}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              {view === 'home' && <HomePage />}
              {view === 'category' && <CategoryPage />}
              {view === 'pdp' && <PDPPage />}
              {view === 'kit' && <KitBuilder />}
              {view === 'orders' && <OrdersPage />}
              {/* Merch Tool is admin-only. Customer accounts get redirected to home. */}
              {view === 'merch' && (user.role === 'admin' ? <MerchTool /> : <AccessDenied />)}
              {view === 'cart' && <CartPage />}
            </motion.div>
          </AnimatePresence>

          {/* Footer build label */}
          <footer style={{ borderTop: `1px solid ${T.hairline}`, padding: '32px', textAlign: 'center', marginTop: 40, background: T.ink }}>
            <div className="mono" style={{ color: T.text3 }}>
              TechDay Demo · Academy Sports + Outdoors · Active adapter:{' '}
              <span style={{ color: T.cyan, fontWeight: 700 }}>{adapterDesc.name}</span>
              {' · '}Mode: <span style={{ color: T.amber }}>{adapterDesc.mode}</span>
            </div>
          </footer>

          {/* Floating AI chat widget — always visible on every page */}
          <ChatWidget />
        </div>
      )}
    </AppCtx.Provider>
  );
}
