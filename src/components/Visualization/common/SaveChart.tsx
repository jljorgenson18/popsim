import React from 'react';
import { CategoricalChartWrapper } from 'recharts';
import { Button } from 'grommet';

interface SaveChartProps {
  visualization: string;
  sampleName: string;
  chartRef: React.MutableRefObject<CategoricalChartWrapper>;
}

function triggerDownload(uri: string, fileName = 'export') {
  const downloadLink = document.createElement('a');
  downloadLink.href = uri;
  downloadLink.download = fileName + '.png';
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
}

/**
 * Stolen from https://stackoverflow.com/questions/28226677/save-inline-svg-as-jpeg-png-svg
 * and then modified for our purposes
 */
function downloadSVG(ele: SVGSVGElement, fileName = 'export'): Promise<void> {
  const currentTextStyles = window.getComputedStyle(ele.querySelector('text'));
  const clonedSvg = ele.cloneNode(true);
  const styleEle = document.createElement('style');
  styleEle.innerHTML = `
    text {
      font-family: ${currentTextStyles.fontFamily};
    }
  `;
  clonedSvg.insertBefore(styleEle, clonedSvg.firstChild);
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = ele.clientWidth;
  tempCanvas.height = ele.clientHeight;
  const svgData = new XMLSerializer().serializeToString(clonedSvg);
  const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
  const svgUrl = URL.createObjectURL(svgBlob);
  const tempImg = new Image();
  return new Promise((resolve, reject) => {
    tempImg.onload = function() {
      tempCanvas.getContext('2d').drawImage(tempImg, 0, 0);
      URL.revokeObjectURL(svgUrl);
      const dataUrl = tempCanvas.toDataURL('image/png', 1);
      triggerDownload(dataUrl, fileName);
      resolve();
    };
    tempImg.onerror = function() {
      reject(new Error('Failed to load image'));
    };
    tempImg.src = svgUrl;
  });
}

function SaveChart(props: SaveChartProps) {
  const { chartRef, sampleName, visualization } = props;
  function handleClick() {
    if (!(chartRef && chartRef.current)) return;
    const container = (chartRef.current as any).container as HTMLElement;
    const svg = container.querySelector('svg');
    if (svg) downloadSVG(svg, encodeURIComponent(`${sampleName}.${visualization}`));
  }
  return <Button primary gap="small" onClick={handleClick} label={'Save chart'}></Button>;
}

export default SaveChart;
