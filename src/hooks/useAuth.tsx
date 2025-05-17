"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  isCreatorLoggedIn: boolean;
  login: (username_input: string, password_input: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const CREATOR_AUTH_KEY = 'creatorLoggedIn';
const CREATOR_USERNAME = "pannikutty";
// This is the SHA-256 hash of the password "Kayushan204070"
const HASHED_CREATOR_PASSWORD = "53210ab50cc85f3036747acf4aa376cc2e0c356b94cf1e699b49c661131bb244";

// Pure JavaScript implementation of SHA-256
function sha256Pure(str: string): string {
  const utf8 = new TextEncoder().encode(str);
  const hashArray = [
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
    0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
  ];

  const K = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
  ];

  function rightRotate(value: number, amount: number): number {
    return (value >>> amount) | (value << (32 - amount));
  }

  // Pre-processing
  const padded = new Uint8Array(Math.ceil((utf8.length + 9) / 64) * 64);
  padded.set(utf8);
  padded[utf8.length] = 0x80;
  const dv = new DataView(padded.buffer);
  dv.setUint32(padded.length - 4, utf8.length * 8, false);

  // Process the message in 512-bit chunks
  for (let offset = 0; offset < padded.length; offset += 64) {
    const chunk = new Uint32Array(64);
    for (let i = 0; i < 16; i++) {
      chunk[i] = dv.getUint32(offset + i * 4, false);
    }

    for (let i = 16; i < 64; i++) {
      const s0 = rightRotate(chunk[i-15], 7) ^ rightRotate(chunk[i-15], 18) ^ (chunk[i-15] >>> 3);
      const s1 = rightRotate(chunk[i-2], 17) ^ rightRotate(chunk[i-2], 19) ^ (chunk[i-2] >>> 10);
      chunk[i] = (chunk[i-16] + s0 + chunk[i-7] + s1) >>> 0;
    }

    let [a, b, c, d, e, f, g, h] = hashArray;

    for (let i = 0; i < 64; i++) {
      const S1 = rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25);
      const ch = (e & f) ^ (~e & g);
      const temp1 = (h + S1 + ch + K[i] + chunk[i]) >>> 0;
      const S0 = rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (S0 + maj) >>> 0;

      h = g;
      g = f;
      f = e;
      e = (d + temp1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) >>> 0;
    }

    hashArray[0] = (hashArray[0] + a) >>> 0;
    hashArray[1] = (hashArray[1] + b) >>> 0;
    hashArray[2] = (hashArray[2] + c) >>> 0;
    hashArray[3] = (hashArray[3] + d) >>> 0;
    hashArray[4] = (hashArray[4] + e) >>> 0;
    hashArray[5] = (hashArray[5] + f) >>> 0;
    hashArray[6] = (hashArray[6] + g) >>> 0;
    hashArray[7] = (hashArray[7] + h) >>> 0;
  }

  return hashArray.map(n => n.toString(16).padStart(8, '0')).join('');
}  // Helper function to hash a string using SHA-256 (with fallback)
async function sha256(str: string): Promise<string> {
  try {
    if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
      const buffer = new TextEncoder().encode(str);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', buffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      console.log('Using Web Crypto API for hashing');
      return hashHex;
    }
  } catch (error) {
    console.warn('Web Crypto API failed:', error);
  }
  
  console.log('Using pure JS implementation for hashing');
  return sha256Pure(str);
}


export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isCreatorLoggedIn, setIsCreatorLoggedIn] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedAuthStatus = localStorage.getItem(CREATOR_AUTH_KEY);
      if (storedAuthStatus === 'true') {
        setIsCreatorLoggedIn(true);
      }
    }
  }, []);
  const login = useCallback(async (username_input: string, password_input: string): Promise<boolean> => {
    const trimmedUsername = username_input.trim();
    const trimmedPassword = password_input.trim();
    const hashed_password_input = await sha256(trimmedPassword);

    console.log("Attempting login with:");
    console.log("Input Username (trimmed):", `"${trimmedUsername}"`);
    console.log("Expected Username:", `"${CREATOR_USERNAME}"`);
    console.log("Input Password Hash:", `"${hashed_password_input}"`);
    console.log("Expected Password Hash:", `"${HASHED_CREATOR_PASSWORD}"`);

    const usernameMatch = trimmedUsername === CREATOR_USERNAME;

    const passwordMatch = hashed_password_input === HASHED_CREATOR_PASSWORD;

    console.log("Username Match:", usernameMatch);
    console.log("Password Match:", passwordMatch);

    if (usernameMatch && passwordMatch) {
      if (typeof window !== 'undefined') {
        localStorage.setItem(CREATOR_AUTH_KEY, 'true');
      }
      setIsCreatorLoggedIn(true);
      console.log("Login successful");
      toast({
        title: "Login Successful",
        description: "Welcome back!",
        variant: "default",
      });
      return true;
    }
    console.log("Login failed");
    toast({
      title: "Login Failed",
      description: "Invalid username or password",
      variant: "destructive",
    });
    return false;
  }, [setIsCreatorLoggedIn, toast]);

  const logout = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(CREATOR_AUTH_KEY);
    }
    setIsCreatorLoggedIn(false);
    toast({
      title: "Logged Out",
      description: "You have been logged out successfully",
      variant: "default",
    });
    router.push('/'); 
  }, [router, setIsCreatorLoggedIn, toast]);

  const authProviderValue: AuthContextType = { isCreatorLoggedIn, login, logout };

  return (
    <AuthContext.Provider value={authProviderValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

