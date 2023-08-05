import { HttpClient, HttpEvent } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment.prod';

@Injectable({
  providedIn: 'root',
})
export class DownloadService {
  private API_KEY = environment.API_KEY;

  private popularvideos = `https://youtube.googleapis.com/youtube/v3/videos?part=snippet%2CcontentDetails%2Cstatistics&chart=mostPopular&maxResults=20&regionCode=US&key=${this.API_KEY}`;
  private DownloadURL = 'https://yt-api-vpdm-dev.fl0.io/';
  private DownloadInfo = 'https://yt-api-vpdm-dev.fl0.io/info';

  constructor(private http: HttpClient) {}

  getVideos(search: string | null) {
    const API = `https://youtube.googleapis.com/youtube/v3/search?part=snippet&2CcontentDetails&maxResults=20&q=${search}&type=video&key=${this.API_KEY}`;
    return this.http.get(API);
  }

  getInformationVideo(url: string) {
    return this.http.post(this.DownloadInfo, { url });
  }

  getMostPopularVideos() {
    return this.http.get(this.popularvideos);
  }

  Download(body: any): Observable<HttpEvent<Blob>> {
    const bodyToSend = {
      url: body.url,
      quality: body.quality,
      format: body.format,
    };

    return this.http.post<Blob>(this.DownloadURL, bodyToSend, {
      reportProgress: true,
      observe: 'events',
      responseType: 'blob' as 'json',
    });
  }
}
