import { Pipe, PipeTransform } from '@angular/core';
import { DocumentListVersion, isCompleted } from '@app/core/document-consent/interfaces/document-list.interface';

@Pipe({
    name: 'userResponded',
    standalone: true,
})
export class UserRespondedPipe implements PipeTransform {
    transform(versions: DocumentListVersion[]): [boolean, string | undefined] {
        return userResponded(versions);
    }
}

export const userResponded = (versions: DocumentListVersion[]): [boolean, string | undefined] => {
    const latestVersion = versions.sort((a, b) => b.version - a.version)[0];
    const findSameVersions = versions.filter((version) => version.version === latestVersion.version);
    return [
        findSameVersions.some((version) => isCompleted(version)),
        findSameVersions.find((version) => isCompleted(version))?.completionDate,
    ];
};
