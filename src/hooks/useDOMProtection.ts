"use client";
import { useEffect, useRef, useCallback } from 'react';

interface DOMProtectionConfig {
  targetSelector: string;
  protectedContent: string;
  checkInterval?: number;
  onViolation?: (element: Element, originalContent: string, currentContent: string) => void;
}

export const useDOMProtection = (configs: DOMProtectionConfig[]) => {
  const originalStates = useRef<Map<Element, string>>(new Map());
  const observers = useRef<MutationObserver[]>([]);
  const integrityCheckInterval = useRef<NodeJS.Timeout | null>(null);

  // Store original state of elements
  const captureOriginalState = useCallback(() => {
    configs.forEach(config => {
      const elements = document.querySelectorAll(config.targetSelector);
      elements.forEach(element => {
        originalStates.current.set(element, element.innerHTML);
      });
    });
  }, [configs]);

  // Revert element to original state
  const revertElement = useCallback((element: Element, originalContent: string) => {
    console.warn('🔒 Unauthorized DOM change detected, reverting...', element);
    element.innerHTML = originalContent;

    // Reattach event listeners if needed
    const newElement = document.querySelector(configs.find(c => element.matches(c.targetSelector))?.targetSelector || '');
    if (newElement && element !== newElement) {
      // Copy over any necessary attributes or properties
      Array.from(element.attributes).forEach(attr => {
        if (!newElement.hasAttribute(attr.name)) {
          newElement.setAttribute(attr.name, attr.value);
        }
      });
    }
  }, [configs]);

  // Set up MutationObserver for each config
  useEffect(() => {
    // Capture initial state
    captureOriginalState();

    configs.forEach(config => {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList' || mutation.type === 'attributes') {
            const element = mutation.target as Element;
            const originalContent = originalStates.current.get(element);

            if (originalContent && element.innerHTML !== originalContent) {
              config.onViolation?.(element, originalContent, element.innerHTML);
              revertElement(element, originalContent);
            }
          }
        });
      });

      const elements = document.querySelectorAll(config.targetSelector);
      elements.forEach(element => {
        observer.observe(element, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ['value', 'innerHTML', 'outerHTML']
        });
      });

      observers.current.push(observer);
    });

    // Set up periodic integrity checks
    const checkInterval = configs[0]?.checkInterval || 5000; // Default 5 seconds
    integrityCheckInterval.current = setInterval(() => {
      configs.forEach(config => {
        const elements = document.querySelectorAll(config.targetSelector);
        elements.forEach(element => {
          const originalContent = originalStates.current.get(element);
          if (originalContent && element.innerHTML !== originalContent) {
            console.warn('🔍 Integrity check failed, reverting DOM changes');
            revertElement(element, originalContent);
          }
        });
      });
    }, checkInterval);

    // Cleanup function
    return () => {
      observers.current.forEach(observer => observer.disconnect());
      observers.current = [];

      if (integrityCheckInterval.current) {
        clearInterval(integrityCheckInterval.current);
        integrityCheckInterval.current = null;
      }
    };
  }, [configs, captureOriginalState, revertElement]);

  // Method to manually update protected content (for legitimate changes)
  const updateProtectedContent = useCallback((selector: string, newContent: string) => {
    const elements = document.querySelectorAll(selector);
    elements.forEach(element => {
      originalStates.current.set(element, newContent);
    });
  }, []);

  return {
    updateProtectedContent,
    captureOriginalState
  };
};

export default useDOMProtection;
