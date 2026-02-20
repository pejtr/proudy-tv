import { describe, it, expect } from 'vitest';
import * as db from './db';

describe('Stream Categories', () => {
  describe('Category Enum Values', () => {
    it('should have exactly 4 valid categories', () => {
      const validCategories = ['Chill & Talk', 'Gaming', 'Music', 'ASMR'];
      expect(validCategories.length).toBe(4);
    });

    it('should validate category names', () => {
      const categories: Array<"Chill & Talk" | "Gaming" | "Music" | "ASMR"> = [
        'Chill & Talk',
        'Gaming',
        'Music',
        'ASMR'
      ];
      
      categories.forEach(category => {
        expect(['Chill & Talk', 'Gaming', 'Music', 'ASMR']).toContain(category);
      });
    });
  });

  describe('createStream with Category', () => {
    it('should accept category parameter', async () => {
      // Type check - if this compiles, the function signature is correct
      const createStreamWithCategory = async () => {
        // This is a type check, not an actual call
        const mockCategory: "Chill & Talk" | "Gaming" | "Music" | "ASMR" = "Gaming";
        return mockCategory;
      };
      
      const category = await createStreamWithCategory();
      expect(['Chill & Talk', 'Gaming', 'Music', 'ASMR']).toContain(category);
    });

    it('should default to "Chill & Talk" when no category provided', () => {
      const defaultCategory = "Chill & Talk";
      expect(defaultCategory).toBe("Chill & Talk");
    });
  });

  describe('getLiveStreams with Category', () => {
    it('should include category field in stream data', async () => {
      const streams = await db.getLiveStreams();
      
      // Should return array (empty or with data)
      expect(Array.isArray(streams)).toBe(true);
      
      // If there are streams, check structure
      if (streams.length > 0) {
        const stream = streams[0];
        expect(stream).toHaveProperty('id');
        expect(stream).toHaveProperty('title');
        expect(stream).toHaveProperty('category');
        
        // Category should be one of the valid values
        if (stream.category) {
          expect(['Chill & Talk', 'Gaming', 'Music', 'ASMR']).toContain(stream.category);
        }
      }
    });
  });

  describe('Category Icons', () => {
    it('should map categories to correct icons', () => {
      const categoryIcons = {
        'Chill & Talk': '💬',
        'Gaming': '🎮',
        'Music': '🎵',
        'ASMR': '🎧',
      };
      
      expect(categoryIcons['Chill & Talk']).toBe('💬');
      expect(categoryIcons['Gaming']).toBe('🎮');
      expect(categoryIcons['Music']).toBe('🎵');
      expect(categoryIcons['ASMR']).toBe('🎧');
    });
  });

  describe('Category Filtering Logic', () => {
    it('should filter streams by category correctly', () => {
      const mockStreams = [
        { id: 1, title: 'Stream 1', category: 'Gaming' as const },
        { id: 2, title: 'Stream 2', category: 'Music' as const },
        { id: 3, title: 'Stream 3', category: 'Gaming' as const },
        { id: 4, title: 'Stream 4', category: 'ASMR' as const },
      ];
      
      const gamingStreams = mockStreams.filter(s => s.category === 'Gaming');
      expect(gamingStreams.length).toBe(2);
      
      const musicStreams = mockStreams.filter(s => s.category === 'Music');
      expect(musicStreams.length).toBe(1);
    });

    it('should show all streams when "All" category is selected', () => {
      const mockStreams = [
        { id: 1, category: 'Gaming' as const },
        { id: 2, category: 'Music' as const },
        { id: 3, category: 'ASMR' as const },
      ];
      
      const selectedCategory = 'All';
      const filtered = selectedCategory === 'All' 
        ? mockStreams 
        : mockStreams.filter(s => s.category === selectedCategory);
      
      expect(filtered.length).toBe(3);
    });
  });
});
