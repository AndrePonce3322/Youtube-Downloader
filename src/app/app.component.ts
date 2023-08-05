import { HttpEventType } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { debounceTime, interval, timer } from 'rxjs';
import { DownloadService } from './Services/DownloadYT';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  @ViewChild('videoplayer') VideoPlayer = Element;

  input = new FormControl('');
  inputResult: string | null = '';
  videosDetails: any[] = [];

  progressBar = {
    porcent: 0,
    total: 0,
    loaded: 0,
  };

  startDownloading = false;
  failedToDownload = false;

  VideoSelectedDetails = {
    channelTitle: '',
    description: '',
    id: '',
    img: '',
    title: '',
  };

  spinnerStatus: boolean = false;

  @ViewChild('sideBar') sideBar!: ElementRef<HTMLIFrameElement>;

  DownloadOptions = {
    format: 'audioonly',
    quality: 'highest',
  };

  constructor(private DownloadSVC: DownloadService) {}

  ngOnInit(): void {
    this.GetMostPopularVideos();

    this.input.valueChanges.pipe(debounceTime(600)).subscribe((val) => {
      const inputValue = this.input.value;
      if (inputValue === '') {
        this.inputResult = null;
        return this.GetMostPopularVideos();
      }

      if (
        inputValue?.startsWith('https://') &&
        inputValue?.indexOf('youtube') != -1
      ) {
        return this.GetInformationVideo(inputValue);
      }

      this.videosDetails = [];

      this.inputResult = val;

      this.DownloadSVC.getVideos(val).subscribe((data: any) => {
        data.items.map((item: any) => {
          const details = {
            id: item.id.videoId,
            title: item.snippet.title,
            description: item.snippet.description,
            img: item.snippet.thumbnails.high.url,
            channelTitle: item.snippet.channelTitle,
            publishedAt: item.snippet.publishedAt,
          };
          this.videosDetails.push(details);
        });
      });
    });

    // YouTube Player API
    const tag = document.createElement('script');

    tag.src = "https://www.youtube.com/iframe_api";
    document.body.appendChild(tag);
  }

  SelectVideo(details: any) {
    this.VideoSelectedDetails = details;
    this.sideBarStatus = true;

    if (this.progressBar.loaded !== 0) {
      this.progressBar = {
        porcent: 0,
        total: 0,
        loaded: 0,
      };
    }
  }

  GetMostPopularVideos() {
    this.videosDetails = [];
    this.DownloadSVC.getMostPopularVideos().subscribe((data: any) => {
      data.items.map((item: any) => {
        const details = {
          id: item.id,
          title: item.snippet.title,
          description: item.snippet.description,
          img: item.snippet.thumbnails.high.url,
          channelTitle: item.snippet.channelTitle,
          publishedAt: item.snippet.publishedAt,
        };

        this.videosDetails.push(details);
      });
    });
  }

  sideBarStatus: boolean = false;
  hiddeSideBar() {
    this.sideBarStatus = !this.sideBarStatus;
  }

  Download() {
    this.startDownloading = true;

    const body = {
      url: `https://www.youtube.com/watch?v=${this.VideoSelectedDetails.id}}`,
      quality: this.DownloadOptions.quality,
      format: this.DownloadOptions.format,
    };

    this.DownloadSVC.Download(body).subscribe((event) => {
      if (event.type === HttpEventType.DownloadProgress) {
        const progress = Math.round((event.loaded / event.total!) * 100);

        this.progressBar = {
          porcent: progress,
          total: event.total!,
          loaded: event.loaded,
        };
      }
      if (event.type === HttpEventType.Response) {
        // Download complete

        timer(2000).subscribe(() => {
          // Espera 2 segundos para ocultar la barra de progreso
          this.startDownloading = false;
        });

        // Downloading blob file
        const blob = event.body!;
        const aElement = document.createElement('a');
        const url = window.URL.createObjectURL(blob);

        aElement.href = url;
        aElement.download = `${this.VideoSelectedDetails.title}`;
        aElement.click();
      }
    });
  }

  GetInformationVideo(value: string) {
    this.spinnerStatus = true;

    const countInterval = interval(1000).subscribe((data) => {
      const time = data;

      if (time === 10) {
        console.log('Time Out');
        this.spinnerStatus = false;
        this.failedToDownload = true;

        timer(4000).subscribe(() => {
          this.failedToDownload = false;
        });

        countInterval.unsubscribe();
        searchVideoInformation.unsubscribe();
        return;
      }
    });

    const searchVideoInformation = this.DownloadSVC.getInformationVideo(
      value
    ).subscribe((data: any) => {
      this.VideoSelectedDetails = {
        title: data.info.title,
        description: data.info.description,
        channelTitle: data.info.author.name,
        img: data.info.thumbnails[3].url,
        id: data.info.videoId,
      };

      this.spinnerStatus = false;
      this.sideBarStatus = true;
      countInterval.unsubscribe();
    });
  }

  generateProgressBar(): string {
    const filledBlocks = Math.floor(this.progressBar.porcent / 6.25); // Número de bloques llenos (cada bloque representa 10%)
    const emptyBlocks = 16 - filledBlocks; // Número de bloques vacíos

    const filledBlockChar = '\u2588'; // Símbolo Unicode para el bloque lleno
    const emptyBlockChar = '\u2591'; // Símbolo Unicode para el bloque vacío

    return (
      filledBlockChar.repeat(filledBlocks) + emptyBlockChar.repeat(emptyBlocks)
    );
  }
}
