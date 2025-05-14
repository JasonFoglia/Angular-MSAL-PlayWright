import { ChangeDetectionStrategy, Component, Signal, ViewEncapsulation } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';

type ProfileType = {
  givenName?: string;
  surname?: string;
  userPrincipalName?: string;
  id?: string;
};

@Component({
  selector: 'app-profile',
  standalone: true,
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileComponent {

  profile: Signal<ProfileType | undefined>;

  constructor(
    private http: HttpClient) {
    this.profile = toSignal(
      this.http.get<ProfileType>(environment.apiConfig.uri),
      { initialValue: undefined }
    );
  }

  ngOnInit(): void {
  }
}
